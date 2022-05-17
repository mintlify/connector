import { User } from "../pages";

export default function ProfilePicture({ size, user }: { size: number; user: User }) {
  const imageSize = size <= 8 ? "text-xs" : "text-base";
  if (!user.profilePicture) {
    // const initials = user.firstName[0] + user.lastName[0];
    const initials = "PN";

    return (
      <div className={`h-${size} w-${size} bg-hover text-white flex items-center justify-center rounded-full`}>
        <p className={imageSize}>{initials}</p>
      </div>
    );
  }

  return (
    <img
      className={`h-${size} w-${size} rounded-full`}
      src="https://res.cloudinary.com/mintlify/image/upload/v1652115323/han_o6mnrb.jpg"
      alt="Profile"
    />
  );
}
