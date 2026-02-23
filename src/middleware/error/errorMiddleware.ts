import { NextFunction, Request, Response } from "express";
import {HumanMessage, SystemMessage} from "langchain";
import {ErrorResponse} from "./ErrorResponse.js";
import {modelAI} from "../../app.js";

//Awaited<ReturnType<typeof initChatModel>> da usare nelle liberie che cambiano spesso

export const PostgresErrorMiddleware = (err: any, _req: Request, res: Response, next: NextFunction) => {
    if (!(err.code || err.name === 'QueryFailedError')) return next(err);

    switch (err.code) {
        // --- VINCOLI SUI DATI ---
        case '23505': // UNIQUE_VIOLATION
            return res.status(409).json({ type: 'DATABASE_ERROR', message: 'Risorsa già esistente (duplicato).' });

        case '23503': // FOREIGN_KEY_VIOLATION
            return res.status(400).json({ type: 'DATABASE_ERROR', message: 'Riferimento esterno non trovato.' });

        case '23502': // NOT_NULL_VIOLATION
            return res.status(400).json({ type: 'DATABASE_ERROR', message: 'Campo obbligatorio mancante.' });

        case '23P01': // CHECK_VIOLATION
            return res.status(400).json({ type: 'DATABASE_ERROR', message: 'Il dato non rispetta i requisiti di validità.' });

        case '22001': // STRING_DATA_RIGHT_TRUNCATION
            return res.status(400).json({ type: 'DATABASE_ERROR', message: 'Testo troppo lungo per il limite consentito.' });

        // --- PROBLEMI DI CONNESSIONE ---
        case '08000': // CONNECTION_EXCEPTION
        case '08006': // CONNECTION_FAILURE
        case '53300': // TOO_MANY_CONNECTIONS
            return res.status(503).json({ type: 'DATABASE_ERROR', message: 'Errore di connessione al database.' });

        // --- LOGICA E TRANSAZIONI ---
        case '42501': // INSUFFICIENT_PRIVILEGE
            return res.status(403).json({ type: 'DATABASE_ERROR', message: 'Permessi insufficienti per questa operazione.' });

        case '42P01': // UNDEFINED_TABLE
            return res.status(500).json({ type: 'DATABASE_ERROR', message: 'Tabella non trovata (errore di configurazione).' });

        case '40001': // SERIALIZATION_FAILURE
        case '40P01': // DEADLOCK_DETECTED
            return res.status(409).json({ type: 'DATABASE_ERROR', message: 'Conflitto di transazione, riprova.' });

        default:
            next(err);
    }
};

export const CapturedErrorMiddleware = (err: ErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    if(err.typeError !== "BusinessLogicDB") next(err as any);

    switch (err.code) {
        case "EMAIL_ALREADY_EXISTS":
            return res.status(409).json({
                type: err.typeError,
                message: err.message,
            })
    }
}

/** veranno aggiunti in futuro altri middleware ma per provare ai lascirò solo questo **/

export const defaultErrorMiddleware = async (err: any, _jreq: Request, res: Response, _next: NextFunction) => {

    if(process.env.NODE_ENV === 'development' && Boolean(process.env.USEAITEST) && modelAI) {

        const conversation = [
            new SystemMessage("Sei un assistente tecnico. Il tuo compito è spiegare l'errore all'utente in modo semplice, senza esporre dettagli sensibili del server (come path di file o password)."),
            new HumanMessage(`Si è verificato il seguente errore: "${err.message}". Spiega cosa potrebbe essere successo.`),
        ];

        try {
            const response = await modelAI.invoke(conversation);

            res.status(500).json({
                message: response.content,
            });

        } catch (aiError) {
            res.status(500).json({
                message: "Errore interno del server."
            });
        }

    }else{

        res.status(500).json({
            message: "Errore interno del server."
        });
    }

}