import { SignupFormData, signupSchema } from "@/schema/authschema";




type signupResult = {
     success: boolean,
     error?: string;
}


export async function signup(data: SignupFormData): Promise<signupResult> {
     // Better Auth handles signup on the client side
     // This server action is not needed for the basic signup flow
     // The client-side signUp.email() method handles everything

     return {
          success: true,
          error: undefined
     }

     
}