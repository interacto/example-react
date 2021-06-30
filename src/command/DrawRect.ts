import {UndoableCommand} from 'interacto';

export class DrawRect extends UndoableCommand {
  private rec: SVGRectElement | undefined = undefined;
  private minX: number = 0;
  private minY: number = 0;
  private maxX: number = 0;
  private maxY: number = 0;

  constructor(private readonly svgdoc: SVGSVGElement) {
    super();
  }

  protected execution(): void {
    if (this.rec === undefined) {
      this.rec = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      this.svgdoc.appendChild(this.rec);
    }
    this.rec.setAttribute('x', this.minX.toString());
    this.rec.setAttribute('y', this.minY.toString());
    this.rec.setAttribute('height', (this.maxY - this.minY).toString());
    this.rec.setAttribute('width', (this.maxX - this.minX).toString());
  }

  public setCoords(minX: number, minY: number, maxX: number, maxY: number): void {
    this.maxY = maxY;
    this.minY = minY;
    this.maxX = maxX;
    this.minX = minX;
  }

  public undo(): void {
    if(this.rec !== undefined) {
      this.svgdoc.removeChild(this.rec);
    }
  }

  public redo(): void {
    if(this.rec !== undefined) {
      this.svgdoc.appendChild(this.rec);
    }
  }

  public getUndoName(): string {
    return 'Draw Rectangle';
  }

  public getVisualSnapshot(): SVGElement | string | undefined {
    if(this.rec !== undefined) {
      const elt = this.rec.cloneNode() as SVGElement;
      elt.setAttribute('left', '0');
      elt.setAttribute('x', '0');
      elt.setAttribute('y', '0');
      return elt;
    }
    return undefined;
  }
}
