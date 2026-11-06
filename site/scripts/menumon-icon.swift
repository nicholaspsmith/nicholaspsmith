// One-time tool: replaces Mac Daddy's character in the Menumon bar with the
// sparkles symbol its Normal Mode draws. Run from site/:
//   swift scripts/menumon-icon.swift
// Slot geometry comes from anim.json: x 645.4, y 3, 24x22 points at 2x.
import AppKit

let slot = CGRect(x: 645.4 * 2, y: 3 * 2, width: 48, height: 44)

func bitmap(_ path: String) -> NSBitmapImageRep {
    NSBitmapImageRep(data: try! Data(contentsOf: URL(fileURLWithPath: path)))!
}

func write(_ rep: NSBitmapImageRep, _ path: String) {
    try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: path))
}

func sparkles(_ color: NSColor, height: CGFloat) -> NSImage {
    let config = NSImage.SymbolConfiguration(pointSize: height, weight: .regular)
        .applying(.init(paletteColors: [color]))
    return NSImage(systemSymbolName: "sparkles", accessibilityDescription: nil)!
        .withSymbolConfiguration(config)!
}

func canvas(width: Int, height: Int) -> NSBitmapImageRep {
    NSBitmapImageRep(
        bitmapDataPlanes: nil, pixelsWide: width, pixelsHigh: height, bitsPerSample: 8,
        samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB,
        bytesPerRow: 0, bitsPerPixel: 0)!
}

func drawing(on rep: NSBitmapImageRep, _ body: () -> Void) {
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
    body()
    NSGraphicsContext.restoreGraphicsState()
}

func place(_ image: NSImage, in box: CGRect) {
    let size = image.size
    let scale = min(box.width / size.width, box.height / size.height)
    let w = size.width * scale, h = size.height * scale
    image.draw(in: CGRect(x: box.midX - w / 2, y: box.midY - h / 2, width: w, height: h))
}

let bar = bitmap("public/menumon/bar.png")

let dark = NSAppearance(named: .darkAqua)!
dark.performAsCurrentDrawingAppearance {
    let states: [NSColor] = [.systemPurple, .systemOrange, .systemRed, .systemGray]

    // The bar: paint out the old icon, then draw the resting state.
    let out = canvas(width: bar.pixelsWide, height: bar.pixelsHigh)
    drawing(on: out) {
        bar.draw(in: CGRect(x: 0, y: 0, width: bar.pixelsWide, height: bar.pixelsHigh))
        // Bitmap y runs down from the top; drawing y runs up from the bottom.
        let flipped = CGRect(
            x: slot.minX, y: CGFloat(bar.pixelsHigh) - slot.maxY, width: slot.width, height: slot.height)
        flipped.fill(using: .clear)
        place(sparkles(states[0], height: 32), in: flipped.insetBy(dx: 6, dy: 6))
    }
    write(out, "public/menumon/bar.png")

    // The state strip. The bar is transparent, and each frame lands exactly on the bar's own sparkles.
    let strip = canvas(width: 48 * states.count, height: 44)
    drawing(on: strip) {
        for (i, color) in states.enumerated() {
            let box = CGRect(x: CGFloat(i) * 48, y: 0, width: 48, height: 44)
            place(sparkles(color, height: 32), in: box.insetBy(dx: 6, dy: 6))
        }
    }
    write(strip, "public/menumon/state-mac-daddy.png")

    // The tile in the app list.
    let tile = canvas(width: 192, height: 192)
    drawing(on: tile) {
        NSColor(red: 0.09, green: 0.07, blue: 0.2, alpha: 1).setFill()
        NSBezierPath(roundedRect: CGRect(x: 0, y: 0, width: 192, height: 192), xRadius: 42, yRadius: 42).fill()
        place(sparkles(.systemPurple, height: 110), in: CGRect(x: 36, y: 36, width: 120, height: 120))
    }
    write(tile, "src/assets/menumon/mac-daddy.png")
}
