/**
 * rooms.js — /our-model-2 (Drake-style) room definitions.
 *
 * Cameras now mirror the human walk-in framings used on /our-model
 * (camera at eye-level inside each room, looking horizontally at the
 * room's fixtures — never top-down). Each room also carries a `fov`
 * value which RoomScene applies to the camera each frame.
 *
 * Imports ROOM_RECTS from journey-chapters.js so /our-model and
 * /our-model-2 can never disagree about where a room is.
 */

import { ROOM_RECTS } from "@/lib/journey-chapters";

const R = ROOM_RECTS;

export const ROOMS = {
  /* Exterior landing — out front, slightly elevated angle so the
   * building's facade reads cleanly. */
  front: {
    title: "Out front",
    cam:    { x: -2.0, y: 2.6, z: 11.0 },
    target: { x: +0.5, y: 1.4, z:  0.0 },
    fov:    55,
    copy: {
      heading: "Welcome to the hubsite",
      body:
        "This is the building the brief calls a TrAC — a Transformation Aspirational Centre. Click an arrow to step inside, or hop between rooms with the strip below.",
    },
    beacons: [
      { type: "arrow", to: "middle-room", label: "Step inside",
        x: R["middle-room"].cx, y: 1.4,
        z: R["middle-room"].cz + R["middle-room"].hz + 0.5, dir: "down" },
      { type: "circle", to: "tank-solar", label: "Water tank + solar",
        x: 8.4, y: 2.8, z: 4.0 },
    ],
  },

  /* Middle / coffee room — camera at the +Z doorway, eye level. */
  "middle-room": {
    title: "Middle room",
    cam:    { x:  0.0, y: 1.6, z: +2.8 },
    target: { x:  0.0, y: 1.1, z: +0.4 },
    fov:    55,
    copy: {
      heading: "Two counters, one shared lobby",
      body:
        "The orange counter serves TrAC services; the blue counter serves Aspire microfinance. Click either to walk up to it.",
    },
    beacons: [
      { type: "arrow", to: "orange-counter", label: "Orange counter",
        x: -0.9, y: 1.0, z: R["middle-room"].cz, dir: "left" },
      { type: "arrow", to: "blue-counter", label: "Blue counter",
        x: +0.9, y: 1.0, z: R["middle-room"].cz, dir: "right" },
      { type: "arrow", to: "shop", label: "Shop",
        x: -1.5, y: 1.0, z: R["middle-room"].cz, dir: "left" },
      { type: "arrow", to: "classroom", label: "Classroom",
        x:  0.0, y: 1.0, z: R["middle-room"].cz - R["middle-room"].hz - 0.2,
        dir: "up" },
      { type: "arrow", to: "front", label: "Back outside",
        x: 0, y: 1.2, z: R["middle-room"].cz + R["middle-room"].hz + 0.8,
        dir: "down" },
    ],
  },

  /* Orange counter — camera shifted right side of middle room,
   * looking at orange (on the left). */
  "orange-counter": {
    title: "Orange counter",
    cam:    { x: +0.7, y: 1.5, z: +2.4 },
    target: { x: -0.9, y: 1.0, z: +0.4 },
    fov:    50,
    copy: {
      heading: "TrAC services brewed in orange",
      body:
        "Identity, education enrolment, agricultural extension and tele-health — all served at the orange counter, alongside a fresh cup of locally-sourced coffee.",
    },
    beacons: [
      { type: "arrow", to: "middle-room", label: "Back to lobby",
        x: 0, y: 1.1, z: +1.6, dir: "up" },
      { type: "arrow", to: "blue-counter", label: "Blue counter",
        x: -0.9, y: 1.0, z: R["middle-room"].cz, dir: "left" },
    ],
  },

  /* Blue counter — mirror of orange. */
  "blue-counter": {
    title: "Blue counter",
    cam:    { x: -0.7, y: 1.5, z: +2.4 },
    target: { x: +0.9, y: 1.0, z: +0.4 },
    fov:    50,
    copy: {
      heading: "Aspire microfinance, served in blue",
      body:
        "Savings, loans, group banking — the second coffee on the menu. A farmer can apply for a loan in the same visit as enrolling a child for school.",
    },
    beacons: [
      { type: "arrow", to: "middle-room", label: "Back to lobby",
        x: 0, y: 1.1, z: +1.6, dir: "up" },
      { type: "arrow", to: "orange-counter", label: "Orange counter",
        x: +0.9, y: 1.0, z: R["middle-room"].cz, dir: "right" },
    ],
  },

  /* Shop — camera at the shop's +Z doorway, looking down the long axis. */
  shop: {
    title: "Shop",
    cam:    { x: -2.6, y: 1.6, z: +2.2 },
    target: { x: -2.6, y: 1.0, z: -2.5 },
    fov:    55,
    copy: {
      heading: "A market on the doorstep",
      body:
        "Fresh produce, grains and household staples — the shop turns the hubsite into a daily destination, not a once-a-month visit.",
    },
    beacons: [
      { type: "arrow", to: "middle-room", label: "Middle room",
        x: -1.5, y: 1.0, z: R["middle-room"].cz, dir: "right" },
    ],
  },

  /* Classroom — camera at +Z doorway, looking back at the desks. */
  classroom: {
    title: "Classroom",
    cam:    { x:  0.0, y: 1.6, z: -0.8 },
    target: { x:  0.0, y: 1.0, z: -2.8 },
    fov:    55,
    copy: {
      heading: "A classroom open to every age",
      body:
        "After-school tutoring, adult literacy, vocational courses — the classroom is where the digital and the textbook meet, with rotating partner teachers.",
    },
    beacons: [
      { type: "arrow", to: "middle-room", label: "Middle room",
        x: 0, y: 1.0, z: R["middle-room"].cz - R["middle-room"].hz - 0.2,
        dir: "down" },
      { type: "arrow", to: "office", label: "Consulting room",
        x: +1.4, y: 1.0, z: R["office"].cz, dir: "right" },
    ],
  },

  /* Office / consulting room — camera at +Z doorway, looking back at
   * the desk. Narrower FOV because the room is small. */
  office: {
    title: "Consulting room",
    cam:    { x: +2.4, y: 1.5, z: -0.6 },
    target: { x: +2.4, y: 1.0, z: -2.5 },
    fov:    50,
    copy: {
      heading: "A quiet table for one-to-one work",
      body:
        "Anything that needs privacy — loan applications, health consults, ID verification — happens in the small consulting room beside the entrance.",
    },
    beacons: [
      { type: "arrow", to: "classroom", label: "Classroom",
        x: +1.4, y: 1.0, z: R["classroom"].cz, dir: "left" },
      { type: "arrow", to: "middle-room", label: "Middle room",
        x: +1.4, y: 1.0, z: R["middle-room"].cz, dir: "left" },
    ],
  },

  /* Pantry / back office — doorway on the -X side, camera there
   * looking east into the room. */
  pantry: {
    title: "Back office",
    cam:    { x: +1.3, y: 1.5, z: +1.0 },
    target: { x: +2.6, y: 1.0, z: +1.0 },
    fov:    50,
    copy: {
      heading: "Where the stock and the day's work live",
      body:
        "Storage shelves, paperwork drawers, the staff working bench — the back office keeps the front of house clean and welcoming.",
    },
    beacons: [
      { type: "arrow", to: "middle-room", label: "Middle room",
        x: 0, y: 1.0, z: R["middle-room"].cz, dir: "left" },
    ],
  },

  /* Tank + solar exterior close-up. Logo plate at ~2 m height. */
  "tank-solar": {
    title: "Tank & solar",
    cam:    { x: +10.5, y: 2.2, z:  +7.5 },
    target: { x:  +8.4, y: 2.2, z:  +4.0 },
    fov:    45,
    copy: {
      heading: "Water and power, marked above the door",
      body:
        "Rooftop solar drives the pumps, the tank stores the day's supply, and the logo on the panel marks the hub as both a water tower and a power station — visible from the road in.",
    },
    beacons: [
      { type: "arrow", to: "front", label: "Back out front",
        x: 0.0, y: 1.8, z: 6.5, dir: "down" },
    ],
  },
};

export const ROOM_ORDER = [
  "front",
  "middle-room",
  "orange-counter",
  "blue-counter",
  "shop",
  "classroom",
  "office",
  "pantry",
  "tank-solar",
];
