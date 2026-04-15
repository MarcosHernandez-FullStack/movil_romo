import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../../app/core/services/loader.service';
import { Subscription, debounceTime } from 'rxjs';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent implements OnDestroy {
  visible = false;
  private sub?: Subscription;

  constructor(private loader: LoaderService) {
    this.sub = this.loader.isLoading$.pipe(debounceTime(150)).subscribe((v) => (this.visible = v));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
