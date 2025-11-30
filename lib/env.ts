// Environment variable exports
// Optional validation - warnings only, doesn't block builds

export const env = {
    supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    },
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    },
    app: {
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || '',
        nodeEnv: process.env.NODE_ENV || 'development',
    },
} as const
