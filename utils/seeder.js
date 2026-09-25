import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Equipment from '../models/Equipment.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Notification.deleteMany();
    await Review.deleteMany();
    await Booking.deleteMany();
    await Equipment.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();

    console.log('[Seeder] Cleared previous database collections.');

    // 1. Create Users
    const users = await User.create([
      {
        name: 'Alexander Vance (Admin)',
        email: 'admin@rentalhub.com',
        password: 'password123',
        role: 'admin',
        phone: '+1 (512) 555-0100',
        companyName: 'RentalHub Platform HQ',
        address: { street: '100 Congress Ave', city: 'Austin', state: 'TX', zipCode: '78701' },
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
      {
        name: 'Apex Equipment Rentals',
        email: 'apexrentals@equipment.com',
        password: 'password123',
        role: 'owner',
        phone: '+1 (512) 555-0219',
        companyName: 'Apex Machinery & Fleet Solutions',
        address: { street: '4500 Industrial Blvd', city: 'Austin', state: 'TX', zipCode: '78744' },
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
      },
      {
        name: 'ProGear & Audio Depot',
        email: 'protools@equipment.com',
        password: 'password123',
        role: 'owner',
        phone: '+1 (512) 555-0344',
        companyName: 'ProGear Event & Construction Tools',
        address: { street: '789 Commercial St', city: 'Dallas', state: 'TX', zipCode: '75201' },
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
      },
      {
        name: 'John Doe (Contractor)',
        email: 'customer@rentalhub.com',
        password: 'password123',
        role: 'customer',
        phone: '+1 (512) 555-0911',
        companyName: 'Doe Civil & Renovation LLC',
        address: { street: '124 Oak Ridge Trail', city: 'Austin', state: 'TX', zipCode: '78704' },
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      },
      {
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@gmail.com',
        password: 'password123',
        role: 'customer',
        phone: '+1 (214) 555-4822',
        companyName: 'Summit Productions',
        address: { street: '902 Main St', city: 'Dallas', state: 'TX', zipCode: '75202' },
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      },
    ]);

    const [adminUser, apexOwner, progearOwner, customerJohn, customerSarah] = users;
    console.log('[Seeder] 5 Users seeded (1 Admin, 2 Owners, 2 Customers).');

    // 2. Create Categories
    const categories = await Category.create([
      {
        name: 'Earthmoving & Heavy Machinery',
        description: 'Excavators, skid steers, track loaders, and trenchers for heavy site works.',
        icon: 'bi-truck',
        image: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Aerial Work Platforms & Lifts',
        description: 'Scissor lifts, boom lifts, and vertical mast personnel lifts for high-reach tasks.',
        icon: 'bi-arrow-up-circle',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Power Tools & Concrete',
        description: 'Demolition hammers, core drills, concrete saws, and compaction equipment.',
        icon: 'bi-hammer',
        image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Commercial Audio & Lighting',
        description: 'Line array sound systems, concert stage lighting, wireless microphones, and trussing.',
        icon: 'bi-speaker',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Lawn, Garden & Forestry',
        description: 'Wood chippers, stump grinders, hydroseeders, and commercial zero-turn mowers.',
        icon: 'bi-flower1',
        image: 'https://images.unsplash.com/photo-1558904541-efa8c4a08931?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Generators & Power Distribution',
        description: 'Towable diesel generators, power distribution boxes, and heavy duty cables.',
        icon: 'bi-lightning-charge',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      },
    ]);

    const [catEarth, catAerial, catTools, catAudio, catLawn, catGen] = categories;
    console.log('[Seeder] 6 Categories seeded.');

    // 3. Create Equipment
    const equipmentItems = await Equipment.create([
      {
        title: 'Caterpillar 305.5 Mini Hydraulic Excavator',
        description:
          'The Cat 305.5 CR delivers high performance, durability, and versatility in a compact design to help you work in tight construction applications. Features enclosed heated/AC cab, hydraulic thumb, and multiple bucket attachments.',
        category: catEarth._id,
        owner: apexOwner._id,
        dailyRate: 350,
        hourlyRate: 50,
        securityDeposit: 500,
        condition: 'Like New',
        location: {
          address: '4500 Industrial Blvd',
          city: 'Austin',
          state: 'TX',
          zipCode: '78744',
        },
        specs: [
          { key: 'Operating Weight', value: '11,958 lb (5,424 kg)' },
          { key: 'Dig Depth', value: '12.5 ft (3.8 m)' },
          { key: 'Horsepower', value: '48.9 hp' },
          { key: 'Fuel Capacity', value: '17.2 gal Diesel' },
        ],
        images: [
          'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        ],
        availability: { isAvailable: true, blockedDates: [] },
        featured: true,
        rating: 4.9,
        numReviews: 8,
        totalRentals: 24,
      },
      {
        title: 'Bobcat T770 Compact Track Loader',
        description:
          'Engineered for maximum pushing power and lift capacity. The Bobcat T770 vertical lift path loader is ideal for loading flatbed trucks, moving pallets of sod, and digging in rocky soils. Rubber tracks provide superior low ground pressure flotation.',
        category: catEarth._id,
        owner: apexOwner._id,
        dailyRate: 290,
        hourlyRate: 45,
        securityDeposit: 400,
        condition: 'Excellent',
        location: {
          address: '4500 Industrial Blvd',
          city: 'Austin',
          state: 'TX',
          zipCode: '78744',
        },
        specs: [
          { key: 'Rated Operating Capacity', value: '3,475 lb' },
          { key: 'Operating Weight', value: '10,515 lb' },
          { key: 'Engine Power', value: '92 hp Turbo Diesel' },
          { key: 'Track Width', value: '17.7 in' },
        ],
        images: [
          'https://images.unsplash.com/photo-1580983218765-f663bec07b37?auto=format&fit=crop&w=800&q=80',
        ],
        availability: { isAvailable: true, blockedDates: [] },
        featured: true,
        rating: 4.8,
        numReviews: 12,
        totalRentals: 35,
      },
      {
        title: 'Genie GS-2646 Electric Scissor Lift',
        description:
          'Quiet, zero-emission electric scissor lift built for indoor maintenance and architectural work. Features a 32-ft working height, roll-out extension deck, and non-marking rugged solid tires.',
        category: catAerial._id,
        owner: apexOwner._id,
        dailyRate: 165,
        hourlyRate: 25,
        securityDeposit: 250,
        condition: 'Excellent',
        location: {
          address: '4500 Industrial Blvd',
          city: 'Austin',
          state: 'TX',
          zipCode: '78744',
        },
        specs: [
          { key: 'Max Working Height', value: '32 ft (9.8 m)' },
          { key: 'Platform Capacity', value: '1,000 lb' },
          { key: 'Machine Width', value: '3 ft 10 in' },
          { key: 'Power Source', value: '24V DC 225 Ah Battery' },
        ],
        images: [
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
        ],
        availability: { isAvailable: true, blockedDates: [] },
        featured: true,
        rating: 5.0,
        numReviews: 6,
        totalRentals: 18,
      },
      {
        title: 'Hilti TE 3000-AVR Heavy Demolition Breaker',
        description:
          'The ultimate tool for slab demolition and heavy concrete breaking. Delivers 50 Joules of impact energy without air compressor hoses. Active Vibration Reduction (AVR) keeps operator fatigue at a minimum.',
        category: catTools._id,
        owner: progearOwner._id,
        dailyRate: 95,
        hourlyRate: 15,
        securityDeposit: 150,
        condition: 'Like New',
        location: {
          address: '789 Commercial St',
          city: 'Dallas',
          state: 'TX',
          zipCode: '75201',
        },
        specs: [
          { key: 'Single Impact Energy', value: '50 ft-lbs (68 J)' },
          { key: 'Weight', value: '65.9 lb' },
          { key: 'Triaxial Vibration', value: '7 m/s²' },
          { key: 'Chuck Type', value: 'HEX 28' },
        ],
        images: [
          'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
        ],
        availability: { isAvailable: true, blockedDates: [] },
        featured: false,
        rating: 4.7,
        numReviews: 5,
        totalRentals: 14,
      },
      {
        title: 'QSC K12.2 & KS118 Live Sound Array Package',
        description:
          'Complete touring-grade 4000-Watt concert PA system package. Includes two QSC K12.2 2000W active tops, two QSC KS118 active 18" subwoofers, heavy-duty mounting poles, and shielded XLR interconnect cables.',
        category: catAudio._id,
        owner: progearOwner._id,
        dailyRate: 220,
        hourlyRate: 35,
        securityDeposit: 300,
        condition: 'Like New',
        location: {
          address: '789 Commercial St',
          city: 'Dallas',
          state: 'TX',
          zipCode: '75201',
        },
        specs: [
          { key: 'Total Power Output', value: '4,000 W Peak Class-D' },
          { key: 'Sub Frequency Range', value: '35 Hz - 111 Hz' },
          { key: 'Max SPL', value: '136 dB' },
          { key: 'Connections', value: 'XLR / TRS Combos' },
        ],
        images: [
          'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
        ],
        availability: { isAvailable: true, blockedDates: [] },
        featured: true,
        rating: 5.0,
        numReviews: 10,
        totalRentals: 22,
      },
      {
        title: 'Bandit 12XPC Towable Brush Chipper',
        description:
          'Industrial wood chipper equipped with a powerful 84-hp diesel engine and a 12-inch chipping capacity. Dual feed wheels pull in bulky limbs and brush without labor-intensive pre-trimming.',
        category: catLawn._id,
        owner: apexOwner._id,
        dailyRate: 240,
        hourlyRate: 35,
        securityDeposit: 350,
        condition: 'Good',
        location: {
          address: '4500 Industrial Blvd',
          city: 'Austin',
          state: 'TX',
          zipCode: '78744',
        },
        specs: [
          { key: 'Chipping Capacity', value: '12 in (30.5 cm)' },
          { key: 'Engine Power', value: '84 HP Perkins Tier 4' },
          { key: 'Feed Table Depth', value: '30 in' },
          { key: 'Tow Hitch', value: '2-5/16" Ball Hitch' },
        ],
        images: [
          'https://images.unsplash.com/photo-1558904541-efa8c4a08931?auto=format&fit=crop&w=800&q=80',
        ],
        availability: { isAvailable: true, blockedDates: [] },
        featured: false,
        rating: 4.6,
        numReviews: 4,
        totalRentals: 11,
      },
      {
        title: 'Multiquip WhisperWatt 45kVA Diesel Generator',
        description:
          'Ultra-quiet commercial mobile power generator on heavy-duty highway trailer. Generates 36 kW prime power at only 65 dBA noise level, perfect for film shoots, festivals, and emergency backup power.',
        category: catGen._id,
        owner: apexOwner._id,
        dailyRate: 280,
        hourlyRate: 40,
        securityDeposit: 400,
        condition: 'Like New',
        location: {
          address: '4500 Industrial Blvd',
          city: 'Austin',
          state: 'TX',
          zipCode: '78744',
        },
        specs: [
          { key: 'Prime Output', value: '36 kW / 45 kVA' },
          { key: 'Voltage Selector', value: '120V / 240V / 480V 3-Phase' },
          { key: 'Fuel Run Time', value: '24 Hours @ Full Load' },
          { key: 'Sound Level', value: '65 dBA @ 23 ft' },
        ],
        images: [
          'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
        ],
        availability: { isAvailable: true, blockedDates: [] },
        featured: true,
        rating: 4.9,
        numReviews: 7,
        totalRentals: 16,
      },
    ]);

    const [excavator, bobcat, scissorLift, hiltiBreaker, qscAudio, banditChipper, generator] =
      equipmentItems;
    console.log(`[Seeder] ${equipmentItems.length} Equipment items seeded.`);

    // 4. Create Bookings with realistic date ranges
    const today = new Date();
    const addDays = (d, n) => {
      const result = new Date(d);
      result.setDate(result.getDate() + n);
      return result;
    };

    const booking1 = await Booking.create({
      bookingReference: 'RHB-108420',
      equipment: excavator._id,
      customer: customerJohn._id,
      owner: apexOwner._id,
      startDate: addDays(today, -10),
      endDate: addDays(today, -6),
      rentalDays: 4,
      dailyRate: excavator.dailyRate,
      equipmentSubtotal: 4 * excavator.dailyRate,
      securityDeposit: excavator.securityDeposit,
      serviceFee: 15,
      totalAmount: 4 * excavator.dailyRate + excavator.securityDeposit + 15,
      status: 'returned',
      deliveryOption: 'delivery',
      deliveryAddress: '1400 Barton Springs Rd, Austin TX',
      customerNotes: 'Needed for site grading and utility trench.',
      ownerNotes: 'Equipment returned in pristine condition with full diesel tank.',
      statusTimeline: [
        { status: 'pending', updatedAt: addDays(today, -12), notes: 'Booking submitted' },
        { status: 'confirmed', updatedAt: addDays(today, -11), notes: 'Approved by Apex Rentals' },
        { status: 'active', updatedAt: addDays(today, -10), notes: 'Delivered to job site' },
        { status: 'returned', updatedAt: addDays(today, -6), notes: 'Inspected and checked back in' },
      ],
      hasReviewed: true,
    });

    const booking2 = await Booking.create({
      bookingReference: 'RHB-209144',
      equipment: qscAudio._id,
      customer: customerSarah._id,
      owner: progearOwner._id,
      startDate: addDays(today, -1),
      endDate: addDays(today, 2),
      rentalDays: 3,
      dailyRate: qscAudio.dailyRate,
      equipmentSubtotal: 3 * qscAudio.dailyRate,
      securityDeposit: qscAudio.securityDeposit,
      serviceFee: 15,
      totalAmount: 3 * qscAudio.dailyRate + qscAudio.securityDeposit + 15,
      status: 'active',
      deliveryOption: 'pickup',
      customerNotes: 'Outdoor music gala at Dallas Arts Plaza.',
      statusTimeline: [
        { status: 'pending', updatedAt: addDays(today, -3), notes: 'Booking requested' },
        { status: 'confirmed', updatedAt: addDays(today, -2), notes: 'Confirmed' },
        { status: 'active', updatedAt: addDays(today, -1), notes: 'Picked up from Dallas warehouse' },
      ],
    });

    const booking3 = await Booking.create({
      bookingReference: 'RHB-309552',
      equipment: bobcat._id,
      customer: customerJohn._id,
      owner: apexOwner._id,
      startDate: addDays(today, 3),
      endDate: addDays(today, 6),
      rentalDays: 3,
      dailyRate: bobcat.dailyRate,
      equipmentSubtotal: 3 * bobcat.dailyRate,
      securityDeposit: bobcat.securityDeposit,
      serviceFee: 15,
      totalAmount: 3 * bobcat.dailyRate + bobcat.securityDeposit + 15,
      status: 'confirmed',
      deliveryOption: 'delivery',
      deliveryAddress: '700 River St, Austin TX',
      customerNotes: 'Pallet loading and gravel dispersion.',
      statusTimeline: [
        { status: 'pending', updatedAt: addDays(today, -1), notes: 'Booking requested' },
        { status: 'confirmed', updatedAt: today, notes: 'Confirmed by Apex Rentals' },
      ],
    });

    const booking4 = await Booking.create({
      bookingReference: 'RHB-408119',
      equipment: scissorLift._id,
      customer: customerJohn._id,
      owner: apexOwner._id,
      startDate: addDays(today, 7),
      endDate: addDays(today, 9),
      rentalDays: 2,
      dailyRate: scissorLift.dailyRate,
      equipmentSubtotal: 2 * scissorLift.dailyRate,
      securityDeposit: scissorLift.securityDeposit,
      serviceFee: 15,
      totalAmount: 2 * scissorLift.dailyRate + scissorLift.securityDeposit + 15,
      status: 'pending',
      deliveryOption: 'pickup',
      customerNotes: 'HVAC duct replacement in ceiling warehouse.',
      statusTimeline: [
        { status: 'pending', updatedAt: today, notes: 'Awaiting owner confirmation' },
      ],
    });

    console.log('[Seeder] 4 Sample bookings seeded across lifecycle states.');

    // 5. Create Reviews
    await Review.create({
      booking: booking1._id,
      equipment: excavator._id,
      customer: customerJohn._id,
      rating: 5,
      comment:
        'The Cat 305.5 was in pristine condition. Apex Equipment dropped it right at our job site on schedule. Hydraulic controls are smooth and fuel consumption was very efficient. Highly recommended!',
      ownerResponse: {
        comment: 'Thank you John! Always a pleasure working with your crew. Come back anytime!',
        respondedAt: addDays(today, -5),
      },
    });

    // 6. Create Notifications
    await Notification.create([
      {
        recipient: apexOwner._id,
        title: 'New Booking Request',
        message: 'John Doe has requested to rent your Genie Scissor Lift for 2 days.',
        type: 'booking',
        link: '/owner/bookings',
        isRead: false,
      },
      {
        recipient: customerJohn._id,
        title: 'Booking Confirmed!',
        message: 'Your rental for the Bobcat T770 Compact Track Loader is confirmed for upcoming dates.',
        type: 'status_update',
        link: '/dashboard/bookings',
        isRead: false,
      },
      {
        recipient: customerSarah._id,
        title: 'Active Rental Reminder',
        message: 'Your QSC K12.2 Audio system rental is currently active. Return due in 2 days.',
        type: 'system',
        link: '/dashboard/bookings',
        isRead: true,
      },
    ]);

    console.log('[Seeder] Database seeding successfully completed!');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error] ${error.message}`);
    process.exit(1);
  }
};

seedData();
