// Public business details shown on the website. Change them here only.
// The same details are repeated for Google in index.html (JSON-LD): keep both in sync.

const phone = (display) => ({ display, tel: `tel:${display.replace(/\s/g, '')}` })

export const business = {
  name: 'VR Space',
  email: 'info@vrspace.co.ke',
  phones: [phone('+254 729 054 607'), phone('+254 793 643 308')],
  whatsapp: {
    display: '+254 729 054 607',
    url: `https://wa.me/254729054607?text=${encodeURIComponent('Hi VR Space! ')}`,
  },
  address: 'The Waterfront Karen (Basement), Nairobi',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=The+Waterfront+Karen+Nairobi',
  hours: [
    { days: 'Monday - Friday', time: '10am - 10pm' },
    { days: 'Saturday', time: '10am - 11pm' },
    { days: 'Sunday', time: '11am - 8pm' },
  ],
  socials: {
    instagram: { handle: 'vrspacex', url: 'https://www.instagram.com/vrspacex' },
    tiktok: { handle: '@vrspaceke', url: 'https://www.tiktok.com/@vrspaceke' },
  },
}

export const mainPhone = business.phones[0]
