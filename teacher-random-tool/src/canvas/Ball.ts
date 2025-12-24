export class Ball {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    number: number;
    color: string;
    isGoals: boolean = false;

    constructor(x: number, y: number, radius: number, number: number, color: string) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.number = number;
        this.color = color;

        // Random initial velocity
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = '#fff';
        ctx.font = `bold ${this.radius}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.number.toString(), this.x, this.y);
    }
}
