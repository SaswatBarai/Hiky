import { z } from 'zod';

export const validateSchema = (schema, property = 'body') => {
    return (req, res, next) => {
        try {
            const dataToValidate = property === 'params' ? req.params : 
                                 property === 'query' ? req.query : req.body;
            
            // Ensure we have data to validate
            if (!dataToValidate) {
                return res.status(400).json({
                    success: false,
                    message: "No data provided for validation"
                });
            }
            
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
            console.error('Validation error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                property,
                dataToValidate
            });
            
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
            
            // Log unexpected errors for debugging
            console.error('Unexpected validation error:', error);
            return res.status(500).json({
                success: false,
                message: "Internal server error during validation",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    };
};

// Combined validation for routes that need both params and query
export const validateCombined = (paramsSchema, querySchema) => {
    return (req, res, next) => {
        try {
            // Validate params if schema provided
            if (paramsSchema && req.params) {
                const validatedParams = paramsSchema.parse(req.params);
                req.params = validatedParams;
            }
            
            // Validate query if schema provided
            if (querySchema) {
                // Ensure req.query exists, even if empty
                req.query = req.query || {};
                const validatedQuery = querySchema.parse(req.query);
                req.query = validatedQuery;
            }
            
            next();
        } catch (error) {
            console.error('Combined validation error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                params: req.params,
                query: req.query
            });
            
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
            
            console.error('Unexpected validation error:', error);
            return res.status(500).json({
                success: false,
                message: "Internal server error during validation",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    };
};
