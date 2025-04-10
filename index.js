import {
    beginText,
    clip,
    closePath,
    drawSvgPath,
    endPath,
    endText,
    fill,
    lineTo,
    moveText,
    moveTo,
    PDFDocument,
    popGraphicsState,
    pushGraphicsState,
    rgb,
    scale,
    setFillingColor,
    setFontAndSize,
    setTextRenderingMode,
    showText,
    StandardFonts,
    TextRenderingMode,
    translate
} from 'pdf-lib'
import * as fs from 'fs'

const viewport = {width: 1024, height: 1024}

// https://www.svgrepo.com/svg/530670/double-helix
const aPaths = [
    'M528 872c1.6-16 16-28.8 32-28.8 14.4 0 27.2 9.6 30.4 24l56-3.2c4.8 0 8 3.2 8 8s-3.2 8-8 8l-57.6 3.2c-3.2 14.4-16 24-30.4 24-12.8 0-25.6-8-30.4-20.8l-144 9.6c-4.8 0-8-3.2-8-8s3.2-8 8-8l144-8z m-94.4-320c3.2-14.4 16-24 30.4-24s27.2 9.6 30.4 24H640c4.8 0 8 3.2 8 8s-3.2 8-8 8h-145.6c-3.2 14.4-16 24-30.4 24s-27.2-9.6-30.4-24h-41.6c-4.8 0-8-3.2-8-8s3.2-8 8-8h41.6z m112-56c3.2-14.4 16-24 30.4-24 12.8 0 24 8 28.8 19.2l33.6-3.2c4.8 0 8 3.2 8 8s-3.2 8-8 8l-30.4 3.2c-1.6 16-14.4 28.8-32 28.8-14.4 0-27.2-9.6-30.4-24l-168 16c-4.8 0-8-3.2-8-8s3.2-8 8-8l168-16z m-96-361.6c3.2-12.8 16-22.4 30.4-22.4 16 0 30.4 12.8 32 28.8l128 11.2c4.8 0 8 4.8 8 8s-4.8 8-8 8l-129.6-11.2c-4.8 11.2-16 19.2-30.4 19.2-16 0-28.8-11.2-32-25.6L376 144c-4.8 0-8-4.8-8-8 0-4.8 4.8-8 8-8l73.6 6.4z m-14.4 305.6c-4.8 1.6-8 0-9.6-4.8-1.6-4.8 0-8 4.8-9.6l160-56c4.8-1.6 8 0 9.6 4.8 1.6 4.8 0 8-4.8 9.6l-160 56z m1.6-216c-4.8-1.6-6.4-6.4-4.8-11.2 1.6-4.8 6.4-6.4 11.2-4.8l152 64c4.8 1.6 6.4 6.4 4.8 11.2-1.6 4.8-6.4 6.4-11.2 4.8l-152-64z m-38.4-40c-4.8-1.6-6.4-4.8-6.4-9.6 1.6-4.8 4.8-6.4 9.6-6.4l224 48c4.8 1.6 6.4 4.8 6.4 9.6-1.6 4.8-4.8 6.4-9.6 6.4l-224-48z m-30.4-80c-4.8 0-8-3.2-8-8s3.2-8 8-8h288c4.8 0 8 3.2 8 8s-3.2 8-8 8H368z m235.2 656l-152 64c-4.8 1.6-8 0-11.2-4.8-1.6-4.8 0-8 4.8-11.2l152-64c4.8-1.6 8 0 11.2 4.8 1.6 4.8-1.6 9.6-4.8 11.2zM406.4 848l216-48c4.8-1.6 8 1.6 9.6 6.4 1.6 4.8-1.6 8-6.4 9.6l-216 48c-4.8 1.6-8-1.6-9.6-6.4 0-4.8 1.6-8 6.4-9.6zM368 936c-4.8 0-8-3.2-8-8s3.2-8 8-8h288c4.8 0 8 3.2 8 8s-3.2 8-8 8H368z m25.6-448c-4.8 1.6-8-1.6-9.6-6.4-1.6-4.8 1.6-8 6.4-9.6l232-48c4.8-1.6 8 1.6 9.6 6.4 1.6 4.8-1.6 8-6.4 9.6l-232 48z m20.8 120c-4.8 0-8-4.8-6.4-9.6s4.8-8 9.6-6.4l208 24c4.8 0 8 4.8 6.4 9.6 0 4.8-4.8 8-9.6 6.4l-208-24z m62.4 40c-4.8-1.6-6.4-6.4-4.8-9.6s6.4-6.4 9.6-4.8l112 40c4.8 1.6 6.4 6.4 4.8 9.6s-6.4 6.4-9.6 4.8l-112-40z',
    'M553.6 305.6C611.2 240 640 171.2 640 80c0-9.6 6.4-16 16-16s16 6.4 16 16c0 100.8-33.6 177.6-97.6 249.6 62.4 70.4 89.6 126.4 89.6 198.4 0 68.8-25.6 123.2-80 185.6C641.6 776 672 848 672 944c0 9.6-6.4 16-16 16s-16-6.4-16-16c0-86.4-25.6-150.4-78.4-208-12.8 12.8-27.2 27.2-43.2 41.6-4.8 4.8-51.2 46.4-64 57.6-22.4 20.8-36.8 36.8-48 52.8-16 20.8-22.4 38.4-22.4 56 0 9.6-6.4 16-16 16s-16-6.4-16-16c0-25.6 9.6-49.6 28.8-75.2 12.8-17.6 28.8-35.2 52.8-56 12.8-11.2 59.2-54.4 64-57.6 16-14.4 28.8-27.2 41.6-40-11.2-11.2-24-20.8-36.8-32-12.8-9.6-89.6-64-107.2-80-28.8-24-43.2-48-43.2-75.2 0-19.2 8-38.4 22.4-56 12.8-16 28.8-32 56-54.4 6.4-6.4 32-25.6 35.2-28.8 14.4-11.2 25.6-20.8 36.8-30.4 11.2-9.6 20.8-19.2 30.4-28.8l-35.2-35.2c-1.6-1.6-33.6-33.6-43.2-41.6-16-16-28.8-28.8-40-41.6-41.6-48-62.4-88-62.4-131.2 0-9.6 6.4-16 16-16s16 6.4 16 16c0 33.6 17.6 67.2 54.4 108.8 11.2 12.8 22.4 24 38.4 40 9.6 9.6 40 40 43.2 41.6 11.2 12.8 22.4 24 33.6 35.2z m6.4 385.6c48-56 72-104 72-163.2 0-60.8-24-112-78.4-174.4-9.6 9.6-19.2 19.2-30.4 28.8 11.2-9.6-105.6 88-123.2 108.8-11.2 12.8-16 25.6-16 36.8 0 16 9.6 32 32 51.2 16 14.4 91.2 67.2 105.6 78.4 14.4 11.2 27.2 20.8 38.4 33.6z',
]

// https://www.svgrepo.com/svg/530675/supercoil
const bPaths = [
    'M280 691.2c-3.2 11.2-6.4 22.4-11.2 33.6-30.4 75.2-20.8 129.6 1.6 147.2 24 17.6 76.8 9.6 137.6-40-25.6-51.2-25.6-118.4-43.2-140.8 25.6 6.4 46.4 35.2 59.2 88 3.2 11.2 6.4 22.4 9.6 32 30.4-20.8 56-27.2 76.8-19.2-16 4.8-36.8 27.2-62.4 49.6 19.2 36.8 44.8 54.4 64 54.4 20.8 0 44.8-17.6 64-54.4-25.6-22.4-46.4-43.2-62.4-49.6 20.8-8 44.8-1.6 76.8 19.2 3.2-9.6 6.4-20.8 9.6-32 12.8-52.8 32-81.6 59.2-88-17.6 22.4-17.6 89.6-43.2 140.8 60.8 49.6 113.6 57.6 137.6 40s32-72 1.6-147.2c-4.8-12.8-8-24-11.2-33.6-35.2-3.2-65.6-9.6-81.6-3.2 11.2-19.2 38.4-28.8 76.8-28.8 0-16 3.2-28.8 11.2-40 0 9.6 4.8 24 11.2 40 80 4.8 129.6-19.2 139.2-48 6.4-19.2-3.2-48-32-78.4-41.6 38.4-102.4 59.2-118.4 81.6-1.6-27.2 20.8-54.4 65.6-83.2 11.2-6.4 20.8-12.8 28.8-20.8-8-6.4-17.6-14.4-28.8-20.8-46.4-28.8-67.2-56-65.6-83.2 16 22.4 76.8 43.2 118.4 81.6 28.8-30.4 38.4-59.2 32-78.4-9.6-27.2-59.2-52.8-139.2-48-6.4 16-11.2 30.4-11.2 40-8-9.6-12.8-22.4-11.2-40-40 0-65.6-9.6-76.8-28.8 17.6 6.4 48 0 81.6-3.2 3.2-11.2 6.4-22.4 11.2-33.6 30.4-75.2 20.8-129.6-1.6-147.2-24-17.6-76.8-9.6-137.6 40 25.6 51.2 25.6 118.4 43.2 140.8-25.6-6.4-46.4-35.2-59.2-88-3.2-11.2-6.4-22.4-9.6-32-30.4 20.8-56 27.2-76.8 19.2 16-4.8 36.8-27.2 62.4-49.6C556.8 145.6 532.8 128 512 128c-20.8 0-44.8 17.6-64 54.4 25.6 22.4 46.4 43.2 62.4 49.6-20.8 8-44.8 1.6-76.8-19.2-3.2 9.6-6.4 20.8-9.6 32-12.8 52.8-32 81.6-59.2 88 17.6-22.4 17.6-89.6 43.2-140.8-60.8-49.6-113.6-57.6-137.6-40s-32 72-1.6 147.2c4.8 12.8 8 24 11.2 33.6 35.2 3.2 65.6 9.6 81.6 3.2-11.2 19.2-38.4 28.8-76.8 28.8 0 16-3.2 28.8-11.2 40 0-9.6-4.8-24-11.2-40-80-4.8-129.6 19.2-139.2 48-6.4 19.2 3.2 48 32 78.4 41.6-38.4 102.4-59.2 118.4-81.6 1.6 27.2-20.8 54.4-65.6 83.2-11.2 6.4-20.8 12.8-28.8 20.8 8 6.4 17.6 14.4 28.8 20.8 46.4 28.8 67.2 56 65.6 83.2-16-22.4-76.8-43.2-118.4-81.6-28.8 30.4-38.4 59.2-32 78.4 9.6 27.2 59.2 52.8 139.2 48 6.4-16 11.2-30.4 11.2-40 8 9.6 12.8 22.4 11.2 40 40 0 65.6 9.6 76.8 28.8-16-9.6-48-3.2-81.6 0z m-35.2 1.6c-51.2 0-102.4-12.8-124.8-81.6-14.4-43.2-6.4-75.2 12.8-99.2-17.6-25.6-25.6-57.6-12.8-99.2 22.4-67.2 73.6-81.6 124.8-81.6-24-56-48-126.4 24-179.2 60.8-44.8 113.6-20.8 155.2 12.8C443.2 142.4 470.4 128 512 128s68.8 14.4 86.4 36.8c41.6-33.6 94.4-57.6 155.2-12.8 72 52.8 49.6 123.2 24 179.2 51.2 0 102.4 12.8 124.8 81.6 14.4 43.2 6.4 75.2-12.8 99.2 17.6 25.6 25.6 57.6 12.8 99.2-22.4 67.2-73.6 81.6-124.8 81.6 24 56 48 126.4-24 179.2-60.8 44.8-113.6 20.8-155.2-12.8-19.2 22.4-44.8 36.8-86.4 36.8s-68.8-14.4-86.4-36.8c-41.6 33.6-94.4 57.6-155.2 12.8-72-52.8-49.6-123.2-25.6-179.2z',
    'M472 374.4c-83.2 16-134.4 84.8-99.2 164.8 36.8 81.6 100.8 116.8 169.6 104 86.4-17.6 137.6-73.6 99.2-158.4-40-92.8-96-126.4-169.6-110.4z m3.2 14.4c65.6-12.8 113.6 14.4 152 99.2 33.6 73.6-9.6 120-88 137.6-60.8 12.8-118.4-19.2-152-94.4-30.4-68.8 14.4-126.4 88-142.4z',
    'M240 683.2l-16-1.6 12.8-100.8 16 1.6-12.8 100.8z m-35.2-11.2h-16l-1.6-129.6h16l1.6 129.6z m-33.6-14.4l-16 1.6L137.6 528l16-1.6 17.6 131.2zM240 340.8l12.8 100.8-16 1.6-12.8-100.8 16-1.6z m-35.2 11.2l-1.6 129.6h-16l1.6-129.6h16z m-33.6 14.4l-17.6 131.2-16-1.6 17.6-131.2 16 1.6z m67.2 454.4l-9.6-12.8 142.4-110.4 9.6 12.8-142.4 110.4z m113.6 65.6l-12.8-9.6 62.4-89.6 12.8 9.6-62.4 89.6z m-102.4-142.4l-9.6-14.4 94.4-59.2 8 12.8-92.8 60.8z m20.8 128l-4.8-4.8 1.6-1.6 120-120 11.2 11.2-120 120c-3.2-1.6-6.4-3.2-8-4.8z m-32-668.8l142.4 110.4-9.6 12.8-142.4-110.4 9.6-12.8zM352 137.6l62.4 89.6-12.8 9.6-62.4-89.6 12.8-9.6z m-102.4 142.4l94.4 59.2-8 12.8-96-57.6 9.6-14.4z m20.8-128c1.6-1.6 4.8-3.2 8-4.8l120 120-11.2 11.2-120-120-1.6-1.6 4.8-4.8zM784 683.2l-12.8-100.8 16-1.6 12.8 100.8-16 1.6z m35.2-11.2l1.6-129.6h16l-1.6 129.6h-16z m33.6-14.4l17.6-131.2 16 1.6-17.6 131.2-16-1.6zM784 340.8l16 1.6-12.8 100.8-16-1.6 12.8-100.8z m35.2 11.2h16l1.6 129.6h-16l-1.6-129.6z m33.6 14.4l16-1.6 17.6 131.2-16 1.6-17.6-131.2z m-67.2 454.4l-142.4-110.4 9.6-12.8 142.4 110.4-9.6 12.8zM672 886.4l-62.4-89.6 12.8-9.6 62.4 89.6-12.8 9.6z m102.4-142.4l-94.4-59.2 8-12.8 94.4 59.2-8 12.8z m-20.8 128c-1.6 1.6-4.8 3.2-8 4.8l-120-120 11.2-11.2 120 120 1.6 1.6-4.8 4.8z m32-668.8l9.6 12.8-142.4 110.4-9.6-12.8 142.4-110.4zM672 137.6l12.8 9.6-62.4 89.6-12.8-9.6L672 137.6z m102.4 142.4l8 12.8L688 352l-8-12.8 94.4-59.2z m-20.8-128l4.8 4.8-1.6 1.6-120 120-11.2-11.2 120-120c3.2 1.6 6.4 3.2 8 4.8zM457.6 812.8l16-1.6 8 72-16 1.6-8-72z m65.6-16l14.4-8 41.6 73.6-14.4 8-41.6-73.6z m-38.4 3.2l14.4-6.4 40 94.4-14.4 6.4-40-94.4z m-27.2-588.8l8-72 16 1.6-8 72-16-1.6z m65.6 16l41.6-73.6 14.4 8-41.6 73.6-14.4-8z m-38.4-3.2l40-94.4 14.4 6.4-40 94.4-14.4-6.4z',
    'M537.6 393.6c-56-11.2-102.4 11.2-139.2 94.4s28.8 120 80 131.2 107.2-19.2 140.8-94.4c33.6-76.8-25.6-120-81.6-131.2z',
];

// Create a new PDFDocument
const pdfDoc = await PDFDocument.create()

const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

// Add a blank page to the document
const page = pdfDoc.addPage()
page.setFont(timesRomanFont)

// removes pushGraphicsState(), popGraphicsState(), and concatTransformationMatrix()
function rawSvg(path, options = {x: 0, y: 0, scale: 1}) {
    const ops = drawSvgPath(path, options);

    return ops.filter(op => {
        return ['q', 'Q', 'cm'].indexOf(op.name) === -1
    })
}

function floodGreen() {
    return [
        setFillingColor(rgb(0, 1, 0)),
        moveTo(-99999, -99999),
        lineTo(-99999, 99999),
        lineTo(99999, 99999),
        lineTo(99999, -99999),
        closePath(),
        fill(),
    ]
}

function drawSvgA() {
    return [
        ...rawSvg(aPaths[0]),
        ...rawSvg(aPaths[1]),
    ]
}

function drawTextA() {
    return [
        beginText(),
        setFillingColor(rgb(1, 0, 0)),
        moveText(100, 250),
        setFontAndSize(page.fontKey, 100),
        showText(timesRomanFont.encodeText('HELLOOOOOOOOOOOOO')),
        endText(),
    ]
}

function drawSvgB() {
    return [
        ...rawSvg(bPaths[0]),
        ...rawSvg(bPaths[1]),
        ...rawSvg(bPaths[2]),
        ...rawSvg(bPaths[3]),
    ]
}

function drawTextB() {
    return [
        beginText(),
        setFillingColor(rgb(0, 0, 1)),
        moveText(100, 290),
        setFontAndSize(page.fontKey, 210),
        showText(timesRomanFont.encodeText('TEXT ALSO WORKS')),
        endText(),
    ]
}

page.pushOperators(...[
    /**
     * SETUP PHASE
     */
    pushGraphicsState(),

    // ensure the SVGs fit in the page
    scale(0.5, 0.5),
    translate(page.getWidth() / 2 - viewport.width / 4, page.getHeight() / 2 + viewport.height / 4),

    /**
     * DRAWING PHASE - just draw the graphics we are diffing
     */
    pushGraphicsState(),

    // draw the first one
    ...drawSvgA(),
    setFillingColor(rgb(1, 0, 0)),
    fill(),

    // draw the second one
    ...drawSvgB(),
    setFillingColor(rgb(0, 0, 1)),
    fill(),

    // draw the text
    setFillingColor(rgb(0, 0, 0)),
    ...drawTextA(),
    ...drawTextB(),

    popGraphicsState(),

    /**
     * Intersection phases: since we can't clip using paths and texts at the same at (afaik),
     * we need to manually generate each of the 4 intersection possibilities (text vs text,
     * path vs path, text A vs path B, text B vs path A).
     *
     * The whole idea here is: create the first clip (text or path) and then the second clip
     * inside the same graphics state, effectively an AND operation. Then we flood the
     * screen with a green rectangle to paint the intersecting areas.
     */

    /**
     * TEXT VS TEXT
     */
    pushGraphicsState(),

    setTextRenderingMode(TextRenderingMode.Clip),
    ...drawTextA(),

    setTextRenderingMode(TextRenderingMode.Clip),
    ...drawTextB(),

    // flood the screen with a green rectangle (that will be clipped by both masks at the same time)
    ...floodGreen(),

    popGraphicsState(),


    /**
     * TEXT A VS PATH B
     */
    pushGraphicsState(),

    // setup text clipping
    setTextRenderingMode(TextRenderingMode.Clip),
    ...drawTextA(),

    // setup second clipping path (which is being clipped by the first one)
    ...drawSvgB(),
    clip(),
    endPath(),

    // flood the screen with a green rectangle (that will be clipped by both masks at the same time)
    ...floodGreen(),

    popGraphicsState(),


    /**
     * TEXT B VS PATH A
     */
    pushGraphicsState(),

    setTextRenderingMode(TextRenderingMode.Clip),
    ...drawTextB(),

    // setup second clipping path (which is being clipped by the first one)
    ...drawSvgA(),
    clip(),
    endPath(),

    // flood the screen with a green rectangle (that will be clipped by both masks at the same time)
    ...floodGreen(),

    popGraphicsState(),


    /**
     * PATH A VS PATH B
     */
    pushGraphicsState(),

    // setup first clipping path
    ...drawSvgA(),
    clip(),
    endPath(),

    // setup second clipping path (which is being clipped by the first one)
    ...drawSvgB(),
    clip(),
    endPath(),

    // flood the screen with a green rectangle (that will be clipped by both masks at the same time)
    ...floodGreen(),

    popGraphicsState(),
    popGraphicsState(),
].filter(Boolean));

// Serialize the PDFDocument to bytes (a Uint8Array)
const pdfBytes = await pdfDoc.save()

fs.writeFileSync('example.pdf', pdfBytes)