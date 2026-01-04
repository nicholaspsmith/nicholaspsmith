import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav-link',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './nav-link.html',
  styleUrl: './nav-link.css',
})
export class NavLink {
  @Input() route: string = '/';
  @Input() label: string = '';
  @Input() isMobile: boolean = false;
  @Output() linkClicked = new EventEmitter<void>();

  desktopClass = 'desktop rounded-md dark:bg-[#04c766] bg-[#253967] from-gray-800 to-gray-900 px-3 py-2 text-sm font-medium text-white transition-all duration-75 shadow-lg active-nav-btn';
  mobileClass = 'mobile block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white';

  onLinkClick(): void {
    this.linkClicked.emit();
  }
}
