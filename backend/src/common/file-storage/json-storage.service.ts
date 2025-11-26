import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class JsonStorageService {
  private readonly filePath = path.join(process.cwd(), 'data', 'sensor-data.json');

  private async ensureFile() {
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await fs.writeFile(this.filePath, JSON.stringify({ records: [] }, null, 2), 'utf8');
    }
  }

  async readAll(): Promise<{ records: any[] }> {
    await this.ensureFile();
    const content = await fs.readFile(this.filePath, 'utf8');
    return JSON.parse(content || '{"records": []}');
  }

  async writeAll(data: { records: any[] }): Promise<void> {
    await this.ensureFile();
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf8');
  }
}
