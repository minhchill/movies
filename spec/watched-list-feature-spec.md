# Watched-List Feature Specification

## Overview
A personal archive system that allows users to save movies/shows they've watched, write reviews, and attach memorable images to their viewing experience.

## 1. Requirements

### Core Features
- **Save/Unsave Movies/Shows**: Click an eye icon to add/remove items from watched list
- **Personal Reviews**: Write and edit text reviews for watched items
- **Image Memories**: Attach multiple images to each watched item (photos, screenshots, etc.)
- **Persistent Storage**: Data persists between browser sessions

### User Stories

#### Phase 1: Basic Save Functionality
- As a user, I can click an eye icon on any movie/show to mark it as watched
- As a user, I can see a visual indication when a movie/show is already in my watched list
- As a user, I can click the eye icon again to remove it from my watched list
- As a user, I can view my complete watched list on a dedicated page

#### Phase 2: Reviews
- As a user, I can write a text review for any watched movie/show
- As a user, I can edit my existing reviews
- As a user, I can see my review when viewing the movie/show details

#### Phase 3: Image Memories
- As a user, I can upload and attach multiple images to a watched movie/show
- As a user, I can view attached images in a gallery format
- As a user, I can remove individual images from a watched item

#### Phase 4: Enhanced Experience
- As a user, I can filter my watched list (by rating, date watched, etc.)
- As a user, I can search through my watched items and reviews

## 2. Data Structure

### WatchedItem
```typescript
interface WatchedItem {
  id: number;                    // TMDB ID
  type: 'movie' | 'tv';         // Content type
  title: string;                // Movie/show title
  posterPath?: string;          // TMDB poster URL
  dateWatched: string;          // ISO date string
  review?: string;              // User's review text
  rating?: number;              // User rating (1-5 stars)
  images: WatchedImage[];       // Attached images
}

interface WatchedImage {
  id: string;                   // Unique image ID
  file: string;                 // Base64 encoded image data
  caption?: string;             // Optional image caption
  dateAdded: string;            // ISO date string
}
```

## 3. Design Approach

### UI/UX Design
- **Eye Icon**: Use react-icons eye symbol (visible/not visible states)
- **Integration**: Add eye icon to existing movie/show cards and detail pages
- **Watched List Page**: Grid layout similar to existing catalog pages
- **Review Form**: Simple textarea with character limit
- **Image Upload**: Drag-and-drop area with preview thumbnails

### Visual States
- **Unwatched**: Outline eye icon (eye-off)
- **Watched**: Filled eye icon (eye-on) with accent color
- **Watched List Badge**: Small indicator showing total count

### Responsive Design
- Mobile: Stack images vertically, smaller text areas
- Tablet/Desktop: Grid layout for images, side-by-side review editing

## 4. Technical Implementation

### Storage Strategy
**Phase 1**: localStorage (Simple and immediate)
- Easy to test and develop
- No backend complexity
- Data persists locally
- ~5-10MB storage limit

**Future**: Database integration
- Firebase/Supabase for cloud sync
- User authentication
- Cross-device synchronization

### State Management
- **Redux Toolkit**: Extend existing TMDB API setup
- **Slice**: `watchedListSlice` with actions for CRUD operations
- **Selectors**: Efficient data retrieval and filtering
- **Persistence**: Redux-persist for localStorage integration

### File Structure
```
src/
├── features/watchedList/
│   ├── components/
│   │   ├── WatchedIcon.tsx        # Eye icon component
│   │   ├── WatchedList.tsx        # Main list view
│   │   ├── ReviewForm.tsx         # Review editing
│   │   ├── ImageUpload.tsx        # Image attachment
│   │   └── ImageGallery.tsx       # Image viewing
│   ├── hooks/
│   │   ├── useWatchedList.tsx     # Custom hooks
│   │   └── useImageUpload.tsx     # Image handling
│   ├── services/
│   │   └── watchedListService.ts  # localStorage operations
│   └── slice/
│       └── watchedListSlice.ts    # Redux state management
├── pages/
│   └── WatchedList/
│       └── index.tsx              # Watched list page
```

### Component Integration Points
- **Movie/Show Cards**: Add WatchedIcon component
- **Detail Pages**: Add review section and image gallery
- **Header Navigation**: Add watched list link with count badge

## 5. Recommended Tech Stack

### New Dependencies
```json
{
  "redux-persist": "^6.0.0",           // localStorage persistence
  "react-dropzone": "^14.2.0",        // File upload handling
  "uuid": "^9.0.0",                   // Unique ID generation
  "@types/uuid": "^9.0.0"             // TypeScript types
}
```

### Utilizing Existing Stack
- **React Icons**: Eye icons for watched state
- **Framer Motion**: Smooth transitions for add/remove animations
- **Tailwind CSS**: Consistent styling with existing design system
- **Redux Toolkit**: State management patterns already in place
- **TypeScript**: Type safety for all new components

## 6. Implementation Phases

### Phase 1: Core Save/Unsave (2-3 hours)
**Files to create:**
- `watchedListSlice.ts` - Basic Redux state
- `WatchedIcon.tsx` - Eye icon component
- `watchedListService.ts` - localStorage operations

**Testing checkpoints:**
- ✅ Eye icon appears on movie cards
- ✅ Clicking toggles watched state
- ✅ State persists after page refresh
- ✅ Watched movies show different icon state

### Phase 2: Reviews (1-2 hours)
**Files to create:**
- `ReviewForm.tsx` - Review editing component
- `WatchedList/index.tsx` - Dedicated page

**Testing checkpoints:**
- ✅ Can write and save reviews
- ✅ Reviews appear in watched list
- ✅ Can edit existing reviews
- ✅ Reviews persist in localStorage

### Phase 3: Image Memories (2-3 hours)
**Files to create:**
- `ImageUpload.tsx` - File upload component
- `ImageGallery.tsx` - Image viewing component
- `useImageUpload.tsx` - Image processing hook

**Testing checkpoints:**
- ✅ Can upload multiple images
- ✅ Images display as thumbnails
- ✅ Can view full-size images
- ✅ Can remove individual images
- ✅ Images persist in localStorage

### Phase 4: Enhanced Features (1-2 hours)
**Features to add:**
- Search/filter functionality
- Export watched list
- Batch operations

## 7. Testing Strategy

### Manual Testing Checklist
Each phase includes specific validation steps that can be easily performed:

**Phase 1:**
1. Navigate to home page
2. Click eye icon on any movie → Should toggle visual state
3. Refresh page → State should persist
4. Check browser localStorage → Data should be stored

**Phase 2:**
1. Add movie to watched list
2. Navigate to watched list page → Should see movie
3. Click on movie → Should open review form
4. Write review and save → Review should persist

**Phase 3:**
1. Upload image to watched movie → Should show thumbnail
2. Click thumbnail → Should open full-size view
3. Remove image → Should disappear from gallery

### Browser Compatibility
- Test localStorage limits (5-10MB typical)
- Test image processing in different browsers
- Verify responsive design on mobile devices

## 8. Future Enhancements

### Potential Features (Post-MVP)
- **Social Features**: Share watched lists with friends
- **Statistics**: Viewing habits, favorite genres
- **Import/Export**: Backup and restore functionality
- **Cloud Sync**: Cross-device synchronization
- **Advanced Search**: Full-text search through reviews
- **Recommendation Engine**: Suggest movies based on watched history

### Migration Path
The localStorage approach provides a clear migration path to cloud storage:
1. Export existing data from localStorage
2. Implement cloud database (Firebase/Supabase)
3. Import user data during first cloud login
4. Maintain backward compatibility

## 9. Risk Mitigation

### Potential Issues
- **Storage Limits**: localStorage has ~5-10MB limit
  - *Solution*: Compress images, warn users about limits
- **Image Processing**: Large images may cause performance issues
  - *Solution*: Resize images client-side before storage
- **Data Loss**: Browser clearing data
  - *Solution*: Export/import functionality, future cloud backup

### Development Risks
- **Scope Creep**: Feature complexity growing
  - *Solution*: Stick to phased approach, test each phase thoroughly
- **Performance**: Large watched lists slowing app
  - *Solution*: Implement virtualization for large lists

---

This specification provides a clear roadmap for implementing the watched-list feature incrementally, with concrete testing checkpoints and a focus on simplicity for iterative development.