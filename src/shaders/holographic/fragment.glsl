uniform vec3 uColor;
uniform float uTime;
uniform float uOpacity;
uniform float uIntensity; // Add intensity uniform

varying vec3 vPosition;
varying vec3 vNormal;

void main()
{
    // Normal calculation
    vec3 normal = normalize(vNormal);
    if (!gl_FrontFacing)
        normal *= -1.0;

    // Stripes effect
    float stripes = mod((vPosition.y - uTime * 0.02) * 20.0, 1.0);
    stripes = pow(stripes, 3.0);

    // Fresnel effect
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 2.0);

    // Falloff for holographic edges
    float falloff = smoothstep(0.8, 0.2, fresnel);

    // Holographic intensity calculation
    float holographic = stripes * fresnel;
    holographic += fresnel * 1.25;
    holographic *= falloff;

    // Apply intensity to the holographic effect
    holographic *= uIntensity;

    // Combine color with holographic intensity and opacity
    vec4 color = vec4(uColor * holographic, uOpacity);

    gl_FragColor = color;

    // Apply tone mapping and color space corrections
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
