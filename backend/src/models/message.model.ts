export class Message {
	id: number | null =null;
	sender_id: number = 0;
	sender_name : string ="";
	receiver_id: number = 0;
	receiver_name : string = "";
	subject: string = "";
	body: string = "";
	timestamp: Date = new Date();
	read: boolean = false;

	constructor(data: Partial<Message>){
			Object.assign(this, data);
	}

	wsr(): any {
		return {
				[this.id ?? "0"]: {
				sender_name: this.sender_name,
				receiver_name: this.receiver_name,
				subject: this.subject,
				body: this.body,
				timestamp: this.timestamp,
				read: this.read,
				},
		};
	}
}

