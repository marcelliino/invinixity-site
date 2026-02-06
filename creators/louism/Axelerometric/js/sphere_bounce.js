class BouncingSphere {
    constructor(initialDirection = null) {
        // Define the bounding box dimensions
        this.boundary = {width : 1024, height : 512, depth : 1024};

        // Random Randominitial position inside the bounding box
        this.position = createVector(
            random(-this.boundary.width * 0.5, this.boundary.width * 0.5),
            random(-this.boundary.height * 0.5, this.boundary.height * 0.5),
            random(-this.boundary.depth * 0.5, this.boundary.depth * 0.5));

        // Set initial direction, or random if none is provided
        if (initialDirection) {
            this.direction =
                initialDirection.copy()
                    .normalize(); // Normalize to ensure unit vector
        } else {
            this.direction = p5.Vector.random3D(); // Random direction vector
        }
        // Random speed between 4 and 12 units
        this.speed = floor(random(2, 12) + 0.5);

        // Flag to check if the sphere hit a wall
        this.hitWall = false;

        this.hue = random(0, 360);
        this.saturation = random(25, 100);
        this.brightness = random(50, 100);
    }

    // Method to update the position of the sphere and check if it hits a wall
    update() {
        // Reset the hitWall flag
        this.hitWall = false;

        // Move the sphere by its direction vector scaled by speed
        this.position.add(p5.Vector.mult(this.direction, this.speed));

        // Check for collisions with the bounding box and reflect the direction
        // vector
        this.checkBounds();
    }

    // Check for collisions with the bounding box
    checkBounds() {
        // X-axis reflection
        if (this.position.x <= -this.boundary.width / 2 ||
            this.position.x >= this.boundary.width / 2) {
            this.direction.x *= -1; // Reflect direction
            this.hitWall = true;    // Mark that a wall was hit
            this.speed = floor(random(2, 12) + 0.5);
        }

        // Y-axis reflection
        if (this.position.y <= -this.boundary.height / 2 ||
            this.position.y >= this.boundary.height / 2) {
            this.direction.y *= -1; // Reflect direction
            this.hitWall = true;    // Mark that a wall was hit
            this.speed = floor(random(2, 12) + 0.5);
        }

        // Z-axis reflection
        if (this.position.z <= -this.boundary.depth / 2 ||
            this.position.z >= this.boundary.depth / 2) {
            this.direction.z *= -1; // Reflect direction
            this.hitWall = true;    // Mark that a wall was hit
            this.speed = floor(random(2, 12) + 0.5);
        }
    }

    // Method to draw the sphere
    display() {
        push();
        colorMode(HSB, 360, 100, 100);

        noFill();
        stroke(this.hue, this.saturation, this.brightness);
        box(this.boundary.width, this.boundary.height, this.boundary.depth);

        translate(this.position.x, this.position.y, this.position.z);

        noStroke();
        if (this.hitWall)
            fill(0, 0, 100);
        else
            fill(this.hue, this.saturation, this.brightness);
        sphere(20); // Draw the sphere
        pop();
    }

    // Return the position and trigger state (whether the sphere hit a wall)
    getPositionAndTrigger() {
        return {
            position : this.position, // Return the current position
            trigger :
                this.hitWall // Return whether it hit a wall (trigger the sound)
        };
    }

    // Method to set a new bounding box size and ensure the sphere remains
    // inside
    setBoundingBox(width, height, depth) {
        this.boundary = {width : width, height : height, depth : depth};
        console.log(`Bounding box set to width: ${width}, height: ${
            height}, depth: ${depth}`);

        // Ensure the sphere is still within the new bounding box
        this.ensureInBounds();
    }

    // Ensure the sphere remains within the bounding box
    ensureInBounds() {
        // Adjust position if outside X bounds
        this.position.x = constrain(this.position.x, -this.boundary.width / 2,
                                    this.boundary.width / 2);

        // Adjust position if outside Y bounds
        this.position.y = constrain(this.position.y, -this.boundary.height / 2,
                                    this.boundary.height / 2);

        // Adjust position if outside Z bounds
        this.position.z = constrain(this.position.z, -this.boundary.depth / 2,
                                    this.boundary.depth / 2);
    }
}
