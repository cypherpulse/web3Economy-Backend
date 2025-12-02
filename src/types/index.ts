// Admin Types
export interface IAdminBase {
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface IAdminResponse extends IAdminBase {
  id: string;
}

export interface IAdminLoginRequest {
  email: string;
  password: string;
}

export interface IAdminRegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
}

// Event Types
export interface IEventBase {
  title: string;
  date: string;
  location: string;
  attendees: number;
  description: string;
  type: string;
  price: string;
  status: 'upcoming' | 'past' | 'live';
  bannerImage: string;
  registrationUrl?: string;
}

export interface IEventResponse extends IEventBase {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEventCreateRequest extends IEventBase {}

export interface IEventUpdateRequest extends Partial<IEventBase> {}

// Social Media Types
export interface ISocialMediaLink {
  platform: string;
  url: string;
}

// Creator Coin Types
export interface ICreatorCoinData {
  symbol: string;
  marketCap: number;
  price: number;
  change24h: number;
}

// Creator Types
export interface ICreatorBase {
  name: string;
  bio: string;
  profileImage: string;
  socialMedia: ISocialMediaLink[];
  creatorCoin: ICreatorCoinData;
  followers: string;
}

export interface ICreatorResponse extends ICreatorBase {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatorCreateRequest extends ICreatorBase {}

export interface ICreatorUpdateRequest extends Partial<ICreatorBase> {}

// Builder Project Types
export interface IBuilderProjectBase {
  title: string;
  creator: string;
  description: string;
  tech: string[];
  status: string;
  users: string;
  tvl: string;
  image: string;
  githubUrl: string;
  socialMedia: ISocialMediaLink[];
  websiteUrl?: string;
}

export interface IBuilderProjectResponse extends IBuilderProjectBase {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBuilderProjectCreateRequest extends IBuilderProjectBase {}

export interface IBuilderProjectUpdateRequest extends Partial<IBuilderProjectBase> {}

// Resource Types
export type ResourceType = 'Tutorial' | 'Documentation' | 'Tool' | 'Video';
export type ResourceLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';

export interface IResourceBase {
  title: string;
  description: string;
  type: ResourceType;
  category: string;
  level: ResourceLevel;
  duration: string;
  author: string;
  downloads: number;
  rating: number;
  students: number;
  image: string;
  resourceUrl: string;
  provider: string;
  tags: string[];
  slug: string;
  featured: boolean;
}

export interface IResourceResponse extends IResourceBase {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IResourceCreateRequest extends Omit<IResourceBase, 'downloads' | 'slug'> {
  slug?: string;
}

export interface IResourceUpdateRequest extends Partial<Omit<IResourceBase, 'slug'>> {}

// Contact Types
export interface IContactSubmissionBase {
  fullName: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  subscribeNewsletter: boolean;
}

export interface IContactSubmissionResponse extends IContactSubmissionBase {
  id: string;
  submittedAt: Date;
}

export interface IContactSubmissionRequest extends IContactSubmissionBase {}

// Newsletter Types
export type SubscriberStatus = 'active' | 'unsubscribed';

export interface INewsletterSubscriberBase {
  email: string;
  source?: string;
  status: SubscriberStatus;
}

export interface INewsletterSubscriberResponse extends INewsletterSubscriberBase {
  id: string;
  subscribedAt: Date;
  unsubscribedAt?: Date;
}

export interface INewsletterSubscribeRequest {
  email: string;
  source?: string;
}

export interface INewsletterUnsubscribeRequest {
  email: string;
}

// API Response Types
export interface IApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: IApiError;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Query Types
export interface IPaginationQuery {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface IResourceQueryParams extends IPaginationQuery {
  category?: string;
  search?: string;
  type?: ResourceType;
  level?: ResourceLevel;
  featured?: boolean;
}

export interface IEventQueryParams extends IPaginationQuery {
  status?: 'upcoming' | 'past' | 'live';
  type?: string;
}
