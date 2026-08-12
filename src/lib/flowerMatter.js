import Matter from "matter-js";

const { Body, Sleeping } = Matter;

export function releaseDraggedFlowerBody(body) {
  Body.setStatic(body, false);
  Sleeping.set(body, false);
  Body.setVelocity(body, { x: 0, y: 0.35 });
  Body.setAngularVelocity(body, 0);
}
