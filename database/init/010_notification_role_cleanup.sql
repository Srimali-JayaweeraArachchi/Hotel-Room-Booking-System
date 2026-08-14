DELETE n FROM notifications n
JOIN users u ON u.id = n.user_id
WHERE u.role = 'guest' AND n.event_type = 'booking_created';
