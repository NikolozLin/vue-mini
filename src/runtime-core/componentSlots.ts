export function initSlots(instance, children) {
    // instance.slots = Array.isArray(children) ? children : [children];
    normalizeObjectSlots(children, instance.slots)
}

function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        if (Object.prototype.hasOwnProperty.call(children, key)) {
            const value = children[key];
            slots[key] = normalizeSlotsValue(value)

        }
    }
}
function normalizeSlotsValue(value) {
    return Array.isArray(value) ? value : [value];
}