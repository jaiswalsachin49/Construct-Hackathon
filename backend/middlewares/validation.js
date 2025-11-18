const z = require('zod');

const registerSchema = z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    teachTags: z.array(z.object({ tag: z.string(), level: z.string() })).min(1),
    learnTags: z.array(z.string()).min(1),
    location: z.object({
        lat: z.number(),
        lng: z.number(),
        areaLabel: z.string().optional()
    }),
    availability: z.string().optional(),
    bio: z.string().optional()
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            res.status(400).json({ errors: error.errors });
        }
    };
};

module.exports = { validateRequest, registerSchema, loginSchema };