const validate = (schema) => {
    return (req, res, next) => {
        try {
            const schemaKeys = Object.keys(schema)
            for (const key of schemaKeys) {
                const value = req[key]
                const parsed = schema[key].parse(value)
                if (key === "query" || key === "params") {
                    Object.assign(req[key], parsed)
                } else {
                    req[key] = parsed
                }
            }
            next()
        } catch (err) {
            next(err)
        }
    }
}

export { validate }
