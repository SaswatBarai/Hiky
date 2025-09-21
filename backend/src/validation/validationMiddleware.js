import { z } from 'zod';

export const validateSchema = (schema, property = 'body') => {
    return (req, res, next) => {
        try {
            const dataToValidate = property === 'params' ? req.params : 
                                 property === 'query' ? req.query : req.body;
            
            const validatedData = schema.parse(dataToValidate);
            
            // Replace the original data with validated data
            if (property === 'params') {
                req.params = validatedData;
            } else if (property === 'query') {
                req.query = validatedData;
            } else {
                req.body = validatedData;
            }
            
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }
            
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    };
};
