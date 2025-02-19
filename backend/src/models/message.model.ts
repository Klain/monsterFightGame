export class Message {
	id: number | null = null;
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
  
	// ✅ Método para serializar datos y enviarlos al frontend
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
  