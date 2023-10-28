// Description: 
// Script for creating noise textures in processing
//
// Copyright (c) 2023 by @UnityAddiction
//
// From:
// - https://twitter.com/UnityAddiction/status/1716048714677293290
// - https://twitter.com/UnityAddiction/status/1716049325040783694

size(256, 256);

for(int i = 0; i < width; i++)
{
    for(int j = 0; j < height; j++)
    {
        stroke(color((int)random(0, 256)));
        point(i, j);
    }
}

save("noiseTexture.png");
