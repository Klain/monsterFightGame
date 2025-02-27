export class Message {
	readonly id: number = 0;
	readonly characterSenderId: number = 0;
	readonly senderName: string = "";
	readonly characterReciverId: number = 0;
	readonly receiverName: string = "";
	readonly subject: string = "";
	readonly body: string = "";
	readonly timestamp: Date = new Date();
	read: boolean = false;
  
	constructor(data: Partial<Message>) {
	  Object.assign(this, data);
	}
  
	wsr(): any {
	  return {
		[this.id ?? "0"]: {
		  sender_name: this.senderName,
		  receiver_name: this.receiverName,
		  subject: this.subject,
		  body: this.body,
		  timestamp: this.timestamp,
		  read: this.read,
		},
	  };
	}
  }
  