'use client';

import TestimonialLoop from './TestimonialLoop';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    location: 'New York, NY',
    rating: 5,
    text: 'Absolutely love my new plants! They arrived in perfect condition and are thriving. The care instructions were so helpful. Highly recommend this shop!',
  },
  {
    id: 2,
    name: 'Michael Chen',
    location: 'Los Angeles, CA',
    rating: 5,
    text: 'Best plant shop I\'ve ever ordered from. Fast shipping, healthy plants, and excellent customer service. My home looks amazing with these plants!',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    location: 'Chicago, IL',
    rating: 5,
    text: 'I\'m a beginner with plants and was worried, but the team helped me choose the perfect plants for my space. Everything is growing beautifully!',
  },
  {
    id: 4,
    name: 'David Thompson',
    location: 'Houston, TX',
    rating: 5,
    text: 'The quality of plants here is exceptional. Each one came well-packaged and healthy. I\'ve already ordered twice and will continue to be a customer!',
  },
  {
    id: 5,
    name: 'Jessica Williams',
    location: 'Miami, FL',
    rating: 5,
    text: 'Amazing selection and the plants are gorgeous! The shipping was fast and packaging was perfect. My indoor garden is now complete thanks to you!',
  },
  {
    id: 6,
    name: 'James Wilson',
    location: 'Seattle, WA',
    rating: 5,
    text: 'Great prices, fast delivery, and beautiful healthy plants. What more could you ask for? This is now my go-to plant shop!',
  },
];

export default function CustomerTestimonials() {
  return (
    <section className="py-16 bg-cream-50 dark:bg-slate-800/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
            What Our Customers Say
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our happy customers have to say about their experience with us.
          </p>
        </div>

        {/* Testimonials Carousel Container */}
        <div className="relative overflow-hidden w-full">
          <TestimonialLoop
            testimonials={testimonials}
            speed={40}
            direction="left"
            gap={24}
            pauseOnHover={true}
            scaleOnHover={true}
          />
        </div>
      </div>
    </section>
  );
}

