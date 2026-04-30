import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private host: string;
  private port: string;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: this.configService.get('SMTP_SERVICE'),
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });

    this.host = this.configService.get('HOST_FOR_EMAIL') || 'host';
    this.port = this.configService.get('PORT_FOR_EMAIL') || '3001';
  }

  async sendEmailConfirmation(
    username: string,
    email: string,
    token: string,
  ): Promise<void> {
    const url = this.host.startsWith('http')
      ? `${this.host}/confirm-email?token=${token}`
      : `http://${this.host}:${this.port}/confirm-email?token=${token}`;

    const info = await this.transporter.sendMail({
      from: `"Webster" <${this.configService.get('SMTP_USER')}>`,
      to: email,
      subject: 'Confirm your email',
      text: `To confirm your registration follow the link: ${url}`,
      html: `
      <h1>Dear ${username}</h1>
      <h1>Welcome to the Webster</h1>
      <p>Please, confirm your registration by following link below</p>
      <a href="${url}">Confirm Email</a>`,
    });

    console.log('Message send: ', info.messageId);
  }
}
