import { Component, signal, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './navbar/navbar';
import { Footer } from './footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements AfterViewInit {
  protected readonly title = signal('frontend');
  protected readonly isHdReady = signal(false);

  @ViewChild('previewVideo') previewVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('hdVideo') hdVideo?: ElementRef<HTMLVideoElement>;

  ngAfterViewInit(): void {
    this.initPreviewVideo();
    this.preloadHdVideo();
  }

  private initPreviewVideo(): void {
    if (this.previewVideo) {
      const video = this.previewVideo.nativeElement;
      video.muted = true;
      video.play().catch((error) => console.log('Preview video autoplay error:', error));
    }
  }

  private preloadHdVideo(): void {
    if (this.hdVideo) {
      const video = this.hdVideo.nativeElement;
      video.muted = true;

      video.addEventListener('canplaythrough', () => {
        this.transitionToHd();
      }, { once: true });

      video.load();
    }
  }

  private transitionToHd(): void {
    if (this.hdVideo && this.previewVideo) {
      const hdVideo = this.hdVideo.nativeElement;
      const previewVideo = this.previewVideo.nativeElement;

      // Sync playback position
      hdVideo.currentTime = previewVideo.currentTime % hdVideo.duration;

      hdVideo.play().then(() => {
        this.isHdReady.set(true);
        // Stop preview after transition completes
        setTimeout(() => {
          previewVideo.pause();
        }, 500);
      }).catch((error) => console.log('HD video autoplay error:', error));
    }
  }
}
