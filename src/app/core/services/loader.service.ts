import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private _pending = 0;
  private _pending$ = new BehaviorSubject<number>(0);

  readonly isLoading$ = this._pending$.pipe(map((n) => n > 0));

  start() {
    this._pending++;
    this._pending$.next(this._pending);
  }

  stop() {
    if (this._pending > 0) {
      this._pending--;
      this._pending$.next(this._pending);
    } else {
      this._pending = 0;
      this._pending$.next(0);
    }
  }

  reset() {
    this._pending = 0;
    this._pending$.next(0);
  }
}
