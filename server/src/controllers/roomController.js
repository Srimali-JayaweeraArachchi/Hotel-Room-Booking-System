import {
  createRoom,
  createRoomType,
  getPublicRoomType,
  listInventoryRooms,
  listInventoryRoomTypes,
  listPublicRoomTypes,
  removeRoom,
  removeRoomType,
  updateRoom,
  updateRoomType,
  addRoomTypeImages,
  removeRoomTypeImage,
  getRoomTypeImageBinary,
} from '../services/roomService.js';

function success(response, data, status = 200) {
  response.status(status).json({ status: 'success', data });
}

export async function serveRoomImage(request, response, next) {
  try {
    const image = await getRoomTypeImageBinary(request.validated.params.id);
    response.set({
      'Content-Type': image.mimeType,
      'Content-Length': image.fileSize,
      'Cache-Control': 'public, max-age=86400',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });
    response.send(image.imageData);
  } catch (error) {
    next(error);
  }
}

export async function listPublic(request, response, next) {
  try {
    success(response, {
      roomTypes: await listPublicRoomTypes(request.validated.query),
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublic(request, response, next) {
  try {
    success(response, {
      roomType: await getPublicRoomType(request.validated.params.id),
    });
  } catch (error) {
    next(error);
  }
}

export async function listTypesAdmin(_request, response, next) {
  try {
    success(response, { roomTypes: await listInventoryRoomTypes() });
  } catch (error) {
    next(error);
  }
}

export async function createTypeAdmin(request, response, next) {
  try {
    success(
      response,
      { roomType: await createRoomType(request.validated.body) },
      201,
    );
  } catch (error) {
    next(error);
  }
}

export async function updateTypeAdmin(request, response, next) {
  try {
    success(response, {
      roomType: await updateRoomType(
        request.validated.params.id,
        request.validated.body,
      ),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTypeAdmin(request, response, next) {
  try {
    await removeRoomType(request.validated.params.id);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function listRoomsAdmin(request, response, next) {
  try {
    success(response, {
      rooms: await listInventoryRooms(request.validated.query),
    });
  } catch (error) {
    next(error);
  }
}

export async function createRoomAdmin(request, response, next) {
  try {
    success(response, { room: await createRoom(request.validated.body) }, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateRoomAdmin(request, response, next) {
  try {
    success(response, {
      room: await updateRoom(
        request.validated.params.id,
        request.validated.body,
      ),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteRoomAdmin(request, response, next) {
  try {
    await removeRoom(request.validated.params.id);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function uploadImagesAdmin(request, response, next) {
  try {
    success(
      response,
      {
        roomType: await addRoomTypeImages(
          request.validated.params.id,
          request.files,
        ),
      },
      201,
    );
  } catch (error) {
    next(error);
  }
}

export async function deleteImageAdmin(request, response, next) {
  try {
    success(response, {
      roomType: await removeRoomTypeImage(
        request.validated.params.id,
        request.validated.params.imageId,
      ),
    });
  } catch (error) {
    next(error);
  }
}
