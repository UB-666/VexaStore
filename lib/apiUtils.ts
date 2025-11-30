// API security utilities for request validation

/**
 * Validates that the request Content-Type is application/json
 * Returns a NextResponse error if invalid, null if valid
 */
export function validateContentType(request: Request) {
    const contentType = request.headers.get('content-type')

    if (!contentType || !contentType.includes('application/json')) {
        return {
            error: 'Content-Type must be application/json',
            status: 415 as const
        }
    }

    return null
}

/**
 * Validates request body size and parses JSON
 * Returns parsed body or error response
 */
export async function parseRequestBody<T = unknown>(
    request: Request,
    maxSize: number = 50000
): Promise<{ data?: T; error?: { message: string; status: number } }> {
    try {
        const text = await request.text()

        if (text.length > maxSize) {
            return {
                error: {
                    message: 'Request body too large',
                    status: 413
                }
            }
        }

        const data = JSON.parse(text) as T
        return { data }
    } catch (err) {
        return {
            error: {
                message: 'Invalid JSON',
                status: 400
            }
        }
    }
}
