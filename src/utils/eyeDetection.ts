import { EyeDetection } from '../types';

export class EyeDetectionService {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isDetecting = false;
  private onDetection?: (detection: EyeDetection) => void;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  startDetection(video: HTMLVideoElement, callback: (detection: EyeDetection) => void): void {
    this.onDetection = callback;
    this.isDetecting = true;
    this.canvas.width = video.videoWidth;
    this.canvas.height = video.videoHeight;
    
    this.detectLoop(video);
  }

  stopDetection(): void {
    this.isDetecting = false;
    this.onDetection = undefined;
  }

  private detectLoop(video: HTMLVideoElement): void {
    if (!this.isDetecting) return;

    this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
    
    // Enhanced eye detection using image analysis
    const detection = this.analyzeFrame();
    
    if (this.onDetection) {
      this.onDetection(detection);
    }

    requestAnimationFrame(() => this.detectLoop(video));
  }

  private analyzeFrame(): EyeDetection {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    // Enhanced brightness and contrast analysis for better eye detection
    // In a real implementation, you'd use a proper ML model
    let totalBrightness = 0;
    let contrastSum = 0;
    let pixelCount = 0;
    
    // Analyze center region where face would typically be
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const regionSize = Math.min(this.canvas.width, this.canvas.height) / 4;
    
    // Sample more points for better accuracy
    for (let y = centerY - regionSize; y < centerY + regionSize; y += 2) {
      for (let x = centerX - regionSize; x < centerX + regionSize; x += 2) {
        if (x >= 0 && x < this.canvas.width && y >= 0 && y < this.canvas.height) {
          const index = (y * this.canvas.width + x) * 4;
          const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
          
          // Calculate local contrast
          const neighbors = this.getNeighborBrightness(data, x, y, this.canvas.width, this.canvas.height);
          const contrast = Math.abs(brightness - neighbors);
          
          totalBrightness += brightness;
          contrastSum += contrast;
          pixelCount++;
        }
      }
    }
    
    const avgBrightness = totalBrightness / pixelCount;
    const avgContrast = contrastSum / pixelCount;
    
    // Enhanced heuristic: combine brightness and contrast for better detection
    const brightnessThreshold = 75;
    const contrastThreshold = 15;
    
    const isOpen = avgBrightness > brightnessThreshold && avgContrast > contrastThreshold;
    const confidence = Math.min(
      (Math.abs(avgBrightness - brightnessThreshold) / brightnessThreshold + 
       avgContrast / 50) / 2, 
      1
    );
    
    return {
      isOpen,
      confidence,
      timestamp: Date.now()
    };
  }

  private getNeighborBrightness(data: Uint8ClampedArray, x: number, y: number, width: number, height: number): number {
    let sum = 0;
    let count = 0;
    
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const index = (ny * width + nx) * 4;
          const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
          sum += brightness;
          count++;
        }
      }
    }
    
    return count > 0 ? sum / count : 0;
  }
}