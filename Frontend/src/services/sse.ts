class SseService {
  private eventSource: EventSource | null = null;
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  connect(onMessage: (data: any) => void) {
    if (this.eventSource) {
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn('SSE connection requires authentication token');
      return;
    }

    const url = `${this.baseUrl}/api/notifications/stream?token=${token}`;
    this.eventSource = new EventSource(url, { withCredentials: true });

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error('Failed to parse SSE event data:', err);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      this.disconnect();
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

export const sseService = new SseService();
