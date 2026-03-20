import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
export const dynamic = 'force-dynamic';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Check Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: 'Image upload not configured. Please set Cloudinary environment variables.' }, { status: 500 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'daisy',
          resource_type: 'image',
        },
        (error: { message?: string } | undefined, result: { secure_url: string } | undefined) => {
          if (error || !result) {
            reject(new Error(error?.message || 'Upload failed'))
          } else {
            resolve(result)
          }
        }
      ).end(buffer)
    })

    return NextResponse.json({ url: uploadResult.secure_url, success: true })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Upload failed' }, { status: 500 })
  }
}
