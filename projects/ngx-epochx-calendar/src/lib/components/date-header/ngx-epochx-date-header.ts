import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateTime } from 'luxon';

@Component({
    selector: 'ngx-epochx-date-header',
    imports: [CommonModule],
    standalone: true,
    templateUrl: './ngx-epochx-date-header.html',
    styleUrls: ['./ngx-epochx-date-header.css']
})
export class NgxEpochxDateHeader implements OnInit, AfterViewInit {
    dateFormatted = signal("");

    @Input() date: Date = new Date();

    @Output() dateChange: EventEmitter<Date> = new EventEmitter<Date>();

    constructor() {}

    ngOnInit(): void {}

    ngAfterViewInit(): void {
        this.dateFormatted.set(DateTime.fromJSDate(this.date).toFormat("MMM dd"));
    }

    protected datePrev() {
        this.date = DateTime.fromJSDate(this.date).minus({day:1}).toJSDate();
        this.dateChanged();
    }

    protected dateNext() {
        this.date = DateTime.fromJSDate(this.date).plus({day:1}).toJSDate();
        this.dateChanged();
    }

    public resetDate() {
        this.date = DateTime.now().toJSDate();
    }

    dateChanged() {
        this.dateFormatted.set(DateTime.fromJSDate(this.date).toFormat("MMM dd"));
        this.dateChange.emit(this.date);
    }
}


