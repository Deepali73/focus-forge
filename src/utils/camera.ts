export class CameraManager {
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement | null = null;

  async initialize(): Promise<HTMLVideoElement> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      this.video = document.createElement('video');
      this.video.srcObject = this.stream;
      this.video.autoplay = true;
      this.video.playsInline = true;
      
      return new Promise((resolve, reject) => {
        this.video!.onloadedmetadata = () => {
          resolve(this.video!);
        };
        this.video!.onerror = reject;
      });
    } catch (error) {
      throw new Error('Failed to access camera: ' + (error as Error).message);
    }
  }

  getVideoElement(): HTMLVideoElement | null {
    return this.video;
  }

  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
      this.video = null;
    }
  }

  static async checkPermissions(): Promise<boolean> {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      return result.state === 'granted';
    } catch {
      return false;
    }
  }
}