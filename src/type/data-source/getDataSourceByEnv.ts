import type { DataSource } from "typeorm"

let _datasource: DataSource | null = null

export const setDataSource = (ds: DataSource) => {
    _datasource = ds
}

export const getDataSource = (): DataSource => {
    if (!_datasource) {
        throw new Error("Database not initialized. Call setDataSource first.")
    }
    return _datasource
}