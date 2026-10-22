export interface VerificationEmail {
  to: string;
  verificationUrl: string;
}

export interface EmailProvider {
  sendVerificationEmail(input: VerificationEmail): Promise<void>;
}

/**
 * Adaptador local/CI. No escribe el token ni el email en logs.
 * Las entregas quedan en memoria solo para pruebas.
 */
export class MockEmailProvider implements EmailProvider {
  readonly deliveries: VerificationEmail[] = [];

  async sendVerificationEmail(input: VerificationEmail): Promise<void> {
    this.deliveries.push(input);
  }
}

export interface EmailProviderEnv {
  EMAIL_PROVIDER?: string;
}

/**
 * Q-09 sigue abierto: no se inventa un proveedor real.
 * `mock` es el único adaptador habilitado en esta fase.
 */
export function createEmailProvider(env: EmailProviderEnv): EmailProvider {
  const provider = env.EMAIL_PROVIDER?.trim().toLowerCase();

  if (provider === 'mock') {
    return new MockEmailProvider();
  }

  throw new Error('EMAIL_PROVIDER_UNSUPPORTED');
}
