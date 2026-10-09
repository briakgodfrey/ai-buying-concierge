// Sample catalog for the demo. Every model name is invented.
// In a real store this would come from the live catalog API. The concierge
// only ever shows facts from here: it never writes its own specs or prices.
//
// stock.ready: units that ship in stock.readyDays business days
// stock.next:  more units arriving in stock.nextDays business days
// promo:       a lower price that only covers up to maxUnits per order

const CATALOG = [
  { id: 'basis-14', name: 'Basis 14', price: 649, memory: 8, storage: 256, screen: 14, weight: 3.2, battery: 9, pro: false, touch: false, gpu: false,
    stock: { ready: 200, readyDays: 3 } },
  { id: 'basis-15', name: 'Basis 15', price: 729, memory: 8, storage: 512, screen: 15.6, weight: 3.9, battery: 8, pro: true, touch: false, gpu: false,
    stock: { ready: 40, readyDays: 3, next: 60, nextDays: 9 } },
  { id: 'meridian-14', name: 'Meridian 14', price: 949, promo: { price: 849, maxUnits: 5 }, memory: 16, storage: 512, screen: 14, weight: 3.1, battery: 12, pro: true, touch: false, gpu: false,
    stock: { ready: 18, readyDays: 3, next: 30, nextDays: 10 } },
  { id: 'atlas-14-touch', name: 'Atlas 14 Touch', price: 1029, memory: 16, storage: 512, screen: 14, weight: 3.3, battery: 11, pro: true, touch: true, gpu: false,
    stock: { ready: 80, readyDays: 4 } },
  { id: 'meridian-16', name: 'Meridian 16', price: 1099, memory: 16, storage: 512, screen: 16, weight: 4.1, battery: 10, pro: true, touch: false, gpu: false,
    stock: { ready: 60, readyDays: 3 } },
  { id: 'meridian-14-plus', name: 'Meridian 14 Plus', price: 1149, memory: 16, storage: 1024, screen: 14, weight: 3.0, battery: 14, pro: true, touch: true, gpu: false,
    stock: { ready: 100, readyDays: 3 } },
  { id: 'cadence-13-air', name: 'Cadence 13 Air', price: 1249, memory: 16, storage: 512, screen: 13.3, weight: 2.4, battery: 16, pro: true, touch: false, gpu: false,
    stock: { ready: 25, readyDays: 4, next: 50, nextDays: 7 } },
  { id: 'cadence-14-pro', name: 'Cadence 14 Pro', price: 1549, memory: 32, storage: 1024, screen: 14, weight: 2.9, battery: 13, pro: true, touch: false, gpu: false,
    stock: { ready: 30, readyDays: 5 } },
  { id: 'summit-16-studio', name: 'Summit 16 Studio', price: 1899, memory: 32, storage: 1024, screen: 16, weight: 4.6, battery: 8, pro: true, touch: false, gpu: true,
    stock: { ready: 12, readyDays: 5, next: 40, nextDays: 12 } }
];
