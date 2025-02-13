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

    /*
    database
        CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        sender_name TEXT NOT NULL,
        receiver_id INTEGER NOT NULL,
        receiver_name TEXT NOT NULL,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
        )
    */
    static parseDb(data: Partial<Message> ): Message {
        const timestamp = typeof data.timestamp === "string" ? new Date(data.timestamp) : data.timestamp;
        return new Message({
            id:data.id,
            sender_id:data.sender_id,
            sender_name:data.sender_name,
            receiver_id: data.receiver_id,
            receiver_name: data.receiver_name,
            subject: data.subject,
            body: data.body,
            timestamp: timestamp,
            read: data.read
        });
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

