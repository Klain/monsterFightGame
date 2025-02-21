export class Message {
	id: number = 0;
	senderId: number = 0;
	senderName: string = "";
	receiverId: number = 0;
	receiverName: string = "";
	subject: string = "";
	body: string = "";
	timestamp: Date = new Date();
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
  