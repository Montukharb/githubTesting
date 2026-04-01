import  passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import dotenv from 'dotenv';
dotenv.config();




passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || ''
  },

  function(accessToken:any, refreshToken:any, profile:any, cb:any) {
    // yaha user milta hai 
    // try{
    
    //   if(!profile)
    //     {
    //        return cb(new Error('No user profile found'), null);   
    //     }
        return cb(null, profile);
      // }catch(err)
      // {
      //   return cb(err, null);
      // }
  }

));


//data will be stored in session store only user.id stored
passport.serializeUser((user:any, done)=> {  
  console.log("serializeUser" , user);
  done(null, user);
});

passport.deserializeUser((id:any, done:any)=>{
   console.log("deserializeUser" , id);
  done(null, id);
});


export default passport;












/*

1. First login:
→ GoogleStrategy
→ DB check/create
→ cb(null, user)

→ serializeUser (run)
→ session me user._id save

2. Next request:
→ cookie aayi
→ deserializeUser (run)
→ DB se user nikla
→ req.user mil gaya



🔥 Ab tera expected logic (correct version)
🔹 Google Strategy (DB + error handle)


import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID!,
  clientSecret: process.env.CLIENT_SECRET!,
  callbackURL: '/auth/google/callback'
},
async (accessToken, refreshToken, profile, cb) => {
  try {
    if (!profile) {
      return cb(new Error("Google profile not found"), null);
    }

    // 🔥 check user in DB (googleId se)
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      // 🔥 create new user
      user = await User.create({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails?.[0]?.value
      });
    }

    return cb(null, user); // success ye db se document send kiya hai serialize ko milege

  } catch (err) {
    return cb(err, null); // error handle
  }
}));



serializeUser (session me kya save hoga)

passport.serializeUser((user: any, done) => {
  try {
    if (!user || !user._id) { //yaha user ma db se document milta hai jo googlestrategy ma save hua tha 
      return done(new Error("User ID not found"), null);
    }

    done(null, user._id); // ✅ only DB id save ya id abb deserializeuser ko mile gi jiss se db se data find hoga
  } catch (err) {
    done(err, null);
  }
});



🔥 deserializeUser (REAL IMPORTANT 🔥)

👉 ❗ Yaha tu galti kar raha tha


passport.deserializeUser(async (id: string, done) => {
  try {
    if (!id) {
      return done(new Error("ID not found in session"), null);
    }

    const user = await User.findById(id);

    if (!user) {
      return done(new Error("User not found in DB"), null);
    }

    done(null, user); // ✅ FULL USER (not id)
    
  } catch (err) {
    done(err, null);
  }
});
*/








// only understanding 

/*
🔥 Core baat (jo tu bol raha hai — CORRECT)

👉 Google profile.id ≠ MongoDB _id
👉 Dono alag cheeze hain ✔️

🔥 Sabse bada misunderstanding

👉 Tu soch raha:

_id ko google id se compare kar rahe

👉 ❌ Aisa bilkul nahi ho raha

🧠 Real flow kya hai
🔹 Step 1: Google se kya milta hai?
profile.id   // 👈 Google ID
🔹 Step 2: DB me kya store karte ho?
{
  _id: "mongoObjectId",      // 👈 Mongo ka apna ID
  googleId: "profile.id"     // 👈 Google ID save ki
}
🔹 Step 3: DB me find kaise karte ho?
User.findOne({ googleId: profile.id })

👉 Yaha match ho raha hai:
👉 googleId ↔ profile.id ✔️

🔥 Ab serializeUser me kya aata hai?
cb(null, user);

👉 Yaha user = DB se aaya document

👉 Isme hota hai:

user._id ✔️
user.googleId ✔️
🔥 Ab tera doubt solve

“user._id kaise mil raha?”

👉 Kyunki tu profile nahi, DB user pass kar raha hai

❌ Agar tu ye kare:
cb(null, profile);

👉 To:

user._id ❌ (nahi milega)
✅ Agar tu ye kare:
cb(null, userFromDB);

👉 To:

user._id ✔️ (milegi)
🔥 serializeUser ka actual kaam
done(null, user._id);

👉 Matlab:
👉 “Session me MongoDB ka ID save karo”

🔥 deserializeUser ka kaam
User.findById(id)

👉 Matlab:
👉 “MongoDB se user wapas lao”

🧠 Simple analogy

👉 Google ID = Aadhaar number
👉 Mongo _id = database ka internal ID

👉 Tu karta kya hai:

Aadhaar se user dhundta
fir apna internal ID use karta
🎯 FINAL CLARITY

👉 ❌ _id ko google id se compare nahi karte
👉 ✅ googleId field me store karke match karte

🔥 Tera code kab sahi hai?
if (!user || !user._id)

👉 ✔️ Jab user = DB user ho

👉 ❌ Jab user = Google profile ho

💥 FINAL TRUTH

👉 Tu galat nahi hai
👉 Bas tu 2 alag objects mix kar raha tha:

Google profile
DB user

 */