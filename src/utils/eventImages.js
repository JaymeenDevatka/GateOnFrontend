/**
 * Curated stock images for event categories.
 * Each category has multiple images to add variety.
 * Images are sourced from Unsplash (free to use).
 */

const CATEGORY_IMAGES = {
    music: [
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=500&fit=crop',
    ],
    tech: [
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=500&fit=crop',
    ],
    business: [
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=500&fit=crop',
    ],
    sports: [
        'https://images.unsplash.com/photo-1461896836934-bd45ba25c907?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=500&fit=crop',
    ],
    art: [
        'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800&h=500&fit=crop',
    ],
    food: [
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=500&fit=crop',
    ],
    health: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=500&fit=crop',
    ],
    education: [
        'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=500&fit=crop',
    ],
    entertainment: [
        'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=500&fit=crop',
    ],
};

// Fallback images for unknown categories
const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&h=500&fit=crop',
];

/**
 * Simple hash function to deterministically pick an image
 * based on the event id or title so the same event always gets
 * the same image.
 */
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

/**
 * Get a stock image URL for an event based on its category and id/title.
 * The same event will always receive the same image.
 *
 * @param {object} event - The event object with { id, title, category }
 * @returns {string|null} - Image URL or null if event has its own image
 */
export function getEventImage(event) {
    // If the event already has a custom image, use it
    if (event.image) return event.image;

    const category = (event.category || '').toLowerCase().trim();
    const images = CATEGORY_IMAGES[category] || FALLBACK_IMAGES;

    // Use event id (or title as fallback) to deterministically pick an image
    const key = String(event.id || event.title || '');
    const index = simpleHash(key) % images.length;

    return images[index];
}
