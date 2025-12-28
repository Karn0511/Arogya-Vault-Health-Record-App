import { Component } from '@angular/core';

@Component({
    selector: 'app-india-map',
    templateUrl: './india-map.component.html',
    styleUrls: ['./india-map.component.scss']
})
export class IndiaMapComponent {
    hoveredRegion: string | null = null;

    regions = [
        { id: 'north', name: 'North India', cx: 150, cy: 100, r: 30 },
        { id: 'south', name: 'South India', cx: 150, cy: 350, r: 30 },
        { id: 'east', name: 'East India', cx: 250, cy: 200, r: 30 },
        { id: 'west', name: 'West India', cx: 80, cy: 200, r: 30 },
        { id: 'central', name: 'Central India', cx: 150, cy: 220, r: 30 }
    ];

    onRegionHover(region: string) {
        this.hoveredRegion = region;
    }

    onRegionLeave() {
        this.hoveredRegion = null;
    }
}
