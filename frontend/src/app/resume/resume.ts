import { Component } from '@angular/core';

@Component({
  selector: 'app-resume',
  imports: [],
  templateUrl: './resume.html',
  styleUrl: './resume.css',
})
export class Resume {
  downloadResume(): void {
    const link = document.createElement('a');
    link.href = '/resume/Nicholas_Smith_Resume_2026.pdf';
    link.download = 'Nicholas_Smith_Resume_2026.pdf';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
