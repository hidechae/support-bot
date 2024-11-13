export interface DocumentMetadata {
    title?: string;
    lastUpdated: Date;
    category?: string;
}

export class Document {
    constructor(
        public readonly url: string,
        public readonly content: string,
        public readonly metadata: DocumentMetadata
    ) {
        this.validate();
    }

    private validate() {
        if (!this.url) throw new Error('URL is required');
        if (!this.content) throw new Error('Content is required');
        if (!this.metadata.lastUpdated) {
            throw new Error('Last updated date is required');
        }
    }

    public isStale(thresholdDays: number): boolean {
        const now = new Date();
        const lastUpdated = new Date(this.metadata.lastUpdated);
        const diffDays = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays > thresholdDays;
    }

    public toJSON() {
        return {
            url: this.url,
            content: this.content,
            metadata: {
                ...this.metadata,
                lastUpdated: this.metadata.lastUpdated.toISOString()
            }
        };
    }
}

