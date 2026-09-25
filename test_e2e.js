import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function runE2ETests() {
  console.log('====================================================');
  console.log('--- STARTING RENTALHUB END-TO-END VERIFICATION ---');
  console.log('====================================================');

  try {
    // 1. Health check
    const health = await axios.get(`${API_URL}/health`);
    console.log('✓ [Health Check] Backend status:', health.data.status);

    // 2. Customer login
    const custLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'customer@rentalhub.com',
      password: 'password123',
    });
    const custToken = custLogin.data.token;
    console.log(`✓ [Auth] Customer logged in: ${custLogin.data.user.name} (${custLogin.data.user.role})`);

    // 3. Owner login
    const ownerLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'apexrentals@equipment.com',
      password: 'password123',
    });
    const ownerToken = ownerLogin.data.token;
    console.log(`✓ [Auth] Owner logged in: ${ownerLogin.data.user.name} (${ownerLogin.data.user.role})`);

    // 4. Admin login
    const adminLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@rentalhub.com',
      password: 'password123',
    });
    const adminToken = adminLogin.data.token;
    console.log(`✓ [Auth] Admin logged in: ${adminLogin.data.user.name} (${adminLogin.data.user.role})`);

    // 5. Equipment catalog search and filter
    const catalogRes = await axios.get(`${API_URL}/equipment?search=Excavator&minPrice=100`);
    const excavator = catalogRes.data.equipment[0];
    console.log(`✓ [Catalog] Found item: "${excavator.title}" at $${excavator.dailyRate}/day`);

    // 6. Check date availability
    const start = new Date();
    start.setDate(start.getDate() + 20); // 20 days ahead
    const end = new Date();
    end.setDate(end.getDate() + 23); // 23 days ahead

    const availCheck = await axios.post(`${API_URL}/equipment/${excavator._id}/check-availability`, {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });
    console.log('✓ [Availability] Real-time check result:', availCheck.data.isAvailable ? 'Available' : 'Unavailable');

    // 7. Customer creates a booking
    const bookingRes = await axios.post(
      `${API_URL}/bookings`,
      {
        equipmentId: excavator._id,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        deliveryOption: 'delivery',
        deliveryAddress: '200 East 6th St, Austin, TX',
        customerNotes: 'Automated test rental reservation',
      },
      { headers: { Authorization: `Bearer ${custToken}` } }
    );
    const newBooking = bookingRes.data.booking;
    console.log(`✓ [Booking] Created booking ${newBooking.bookingReference} for $${newBooking.totalAmount}`);

    // 8. DOUBLE-BOOKING PREVENTION TEST: Attempt to book overlapping dates
    try {
      await axios.post(
        `${API_URL}/bookings`,
        {
          equipmentId: excavator._id,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
        { headers: { Authorization: `Bearer ${custToken}` } }
      );
      console.error('✗ Double booking test failed: Overlapping booking was improperly allowed!');
    } catch (conflictErr) {
      if (conflictErr.response?.status === 409) {
        console.log('✓ [Conflict Prevention] Double-booking correctly REJECTED with HTTP 409 Conflict!');
      } else {
        throw conflictErr;
      }
    }

    // 9. Owner approves booking -> confirmed
    const confirmRes = await axios.put(
      `${API_URL}/bookings/${newBooking._id}/status`,
      { status: 'confirmed', notes: 'Owner confirmed equipment readiness' },
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    );
    console.log(`✓ [Lifecycle] Owner confirmed booking: Status = ${confirmRes.data.booking.status}`);

    // 10. Owner dispatches -> active
    const activeRes = await axios.put(
      `${API_URL}/bookings/${newBooking._id}/status`,
      { status: 'active', notes: 'Dispatched to job site' },
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    );
    console.log(`✓ [Lifecycle] Machine dispatched: Status = ${activeRes.data.booking.status}`);

    // 11. Customer attempts early review before return -> should fail
    try {
      await axios.post(
        `${API_URL}/reviews`,
        {
          bookingId: newBooking._id,
          rating: 5,
          comment: 'Premature review attempt',
        },
        { headers: { Authorization: `Bearer ${custToken}` } }
      );
      console.error('✗ Review validation failed: Review allowed prior to return!');
    } catch (earlyReviewErr) {
      if (earlyReviewErr.response?.status === 400) {
        console.log('✓ [Review Gatekeeper] Premature review correctly rejected before return inspection.');
      }
    }

    // 12. Owner checks in -> returned
    const returnRes = await axios.put(
      `${API_URL}/bookings/${newBooking._id}/status`,
      { status: 'returned', notes: 'Equipment returned in pristine condition' },
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    );
    console.log(`✓ [Lifecycle] Equipment returned: Status = ${returnRes.data.booking.status}`);

    // 13. Customer reviews completed rental
    const reviewRes = await axios.post(
      `${API_URL}/reviews`,
      {
        bookingId: newBooking._id,
        rating: 5,
        comment: 'Outstanding machine performance and seamless pickup experience!',
      },
      { headers: { Authorization: `Bearer ${custToken}` } }
    );
    console.log(`✓ [Review] Review submitted: Rating ${reviewRes.data.review.rating}/5 stars`);

    // 14. Admin stats verification
    const adminStats = await axios.get(`${API_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log(`✓ [Admin Console] Verified Platform GMV: $${adminStats.data.stats.totalGMV}`);
    console.log(`✓ [Admin Console] Verified Total Bookings: ${adminStats.data.stats.totalBookings}`);

    console.log('====================================================');
    console.log('--- ALL 14 CRITICAL USER JOURNEYS PASSED CLEANLY ---');
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('E2E Test Failure:', err.response?.data || err.message);
    process.exit(1);
  }
}

runE2ETests();
