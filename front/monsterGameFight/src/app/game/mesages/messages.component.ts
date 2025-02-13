import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MessageService } from '../../core/services/message.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
  ],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
})
export class MessagesComponent implements OnInit {
  receivedMessages: any[] = [];
  sentMessages: any[] = [];
  pageReceived = 1;
  pageSent = 1;
  limit = 20;
  totalPagesReceived = 0;
  totalPagesSent = 0;

  messageForm: FormGroup;
  replyForm: FormGroup;

  sending = false;

  constructor(private messageService: MessageService, private fb: FormBuilder) {
    this.messageForm = this.fb.group({
      receiver_id: ['', Validators.required],
      subject: ['', [Validators.required, Validators.maxLength(100)]],
      body: ['', [Validators.required, Validators.maxLength(1000)]],
    });

    this.replyForm = this.fb.group({
      subject: ['', [Validators.required, Validators.maxLength(100)]],
      body: ['', [Validators.required, Validators.maxLength(1000)]],
    });
  }

  ngOnInit(): void {
    this.loadReceivedMessages();
    this.loadSentMessages();
  }

  loadReceivedMessages(): void {
    this.messageService.getMessagesInbox(this.pageReceived, this.limit).subscribe((response) => {
      this.receivedMessages = response.messages; 
      this.totalPagesReceived = response.totalPages;
    });
  }

  loadSentMessages(): void {
    this.messageService.getMessagesOutbox(this.pageSent, this.limit).subscribe((response) => {
      this.sentMessages = response.messages; 
      this.totalPagesSent = response.totalPages;
    });
  }

  sendMessage(): void {
    if (this.messageForm.invalid) return;

    this.sending = true;
    const { receiver_id, subject, body } = this.messageForm.value;

    this.messageService.sendMessage(receiver_id, subject, body).subscribe(
      () => {
        this.sending = false;
        this.messageForm.reset();
        this.loadSentMessages();
      },
      (error) => {
        console.error('Error al enviar el mensaje:', error);
        this.sending = false;
      }
    );
  }

  markAsRead(messageId: number): void {
    this.messageService.markMessageAsRead(messageId).subscribe(() => {
      this.loadReceivedMessages();
    });
  }

  toggleMessage(message: any): void {
    message.showBody = !message.showBody;
  }

  startReply(message: any): void {
    message.replying = true;
    this.replyForm.patchValue({
      subject: `Re: ${message.subject}`,
      body: '',
    });
  }

  cancelReply(message: any): void {
    message.replying = false;
  }

  sendReply(message: any): void {
    const reply = this.replyForm.value;
    this.sending = true;

    this.messageService
      .sendMessage(message.sender_id, reply.subject, reply.body)
      .subscribe(() => {
        this.sending = false;
        message.replying = false;
        this.loadSentMessages();
      });
  }

  goToPreviousPage(type: 'received' | 'sent'): void {
    if (type === 'received' && this.pageReceived > 1) {
      this.pageReceived--;
      this.loadReceivedMessages();
    } else if (type === 'sent' && this.pageSent > 1) {
      this.pageSent--;
      this.loadSentMessages();
    }
  }

  goToNextPage(type: 'received' | 'sent'): void {
    if (type === 'received' && this.pageReceived < this.totalPagesReceived) {
      this.pageReceived++;
      this.loadReceivedMessages();
    } else if (type === 'sent' && this.pageSent < this.totalPagesSent) {
      this.pageSent++;
      this.loadSentMessages();
    }
  }
}
