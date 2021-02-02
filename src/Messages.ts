import * as fs from 'fs';
import * as pt from 'path';

class Messages
{
    constructor(message: string) {
        const jsonPath = pt.join(__dirname, message);
        const buf = fs.readFileSync(jsonPath);
        this.json = JSON.parse(buf.toString('utf-8'));
    }

    json : any;
}

export const messages = new Messages('messages/messages.json');