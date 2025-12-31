import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AiService } from '@core/services/ai.service';

@Component({
  selector: 'app-image-analysis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-analysis.component.html',
  styleUrls: ['./image-analysis.component.scss']
})
export class ImageAnalysisComponent {
  imageFile: File | null = null;
  imageUrl: string | null = null;
  analysis: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private aiService: AiService) { }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please upload a valid image file (JPEG, PNG, etc.)';
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        this.errorMessage = 'Image file is too large. Please upload an image smaller than 10MB.';
        return;
      }

      this.imageFile = file;
      this.analysis = '';
      this.errorMessage = '';

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageUrl = e.target?.result as string;
      };
      reader.onerror = () => {
        this.errorMessage = 'Failed to read the image file. Please try again.';
      };
      reader.readAsDataURL(file);
    }
  }

  async analyzeImage(): Promise<void> {
    if (!this.imageFile) {
      this.errorMessage = 'Please upload an image first.';
      return;
    }

    if (!this.imageUrl) {
      this.errorMessage = 'Image is still loading. Please wait a moment and try again.';
      return;
    }

    this.isLoading = true;
    this.analysis = '';
    this.errorMessage = '';

    try {
      const result = await this.aiService.analyzeImage({
        imageData: this.imageUrl,
        documentType: 'Medical Document',
      }).toPromise();

      if (!result || !result.success) {
        throw new Error((result as any)?.error || 'Failed to analyze image');
      }

      this.analysis = (result as any)?.analysis || '';
    } catch (error) {
      console.error('Analysis error:', error);

      let errorMsg = 'Failed to analyze image. Please try again.';
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (error && typeof error === 'object' && 'error' in error) {
        errorMsg = (error as any).error?.message || (error as any).message || errorMsg;
      }
      this.errorMessage = errorMsg;

      // Don't show error in analysis field, only in error message area
      this.analysis = '';
    } finally {
      this.isLoading = false;
    }
  }

  clearImage(): void {
    this.imageFile = null;
    this.imageUrl = null;
    this.analysis = '';
    this.errorMessage = '';
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }
}
